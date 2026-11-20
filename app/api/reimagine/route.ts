import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");

    // 1. تحليل الصورة واقتراح 3 مشاريع عبر أحدث موديل سريع ومستقر
    const analysisResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: [
        {
          inlineData: {
            data: base64Image,
            mimeType: file.type,
          },
        },
        "Analyze this old, broken, or forgotten object. Invent 3 creative, practical DIY upcycling projects made specifically for this exact piece.",
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            objectName: { type: Type.STRING },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  timeEstimate: { type: Type.STRING },
                  description: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING },
                  materials: { type: Type.ARRAY, items: { type: Type.STRING } },
                  steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: [
                  "title",
                  "difficulty",
                  "timeEstimate",
                  "description",
                  "imagePrompt",
                  "materials",
                  "steps",
                ],
              },
            },
          },
          required: ["objectName", "projects"],
        },
      },
    });

    const data = JSON.parse(analysisResponse.text!);

    // 2. توليد الصور التخيلية عبر Gemini Image (مع بديل تلقائي مجاني في حال انتهاء الحصة)
    const projectsWithImages = await Promise.all(
      data.projects.map(async (project: any, index: number) => {
        try {
          const imgRes = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite-image",
            contents: `Studio product photography of this finished DIY upcycled project in a bright modern home: ${project.imagePrompt}`,
            config: {
              responseModalities: ["IMAGE"],
            },
          });

          const parts = imgRes.candidates?.at(0)?.content?.parts || [];
          const imagePart = parts.find((p: any) => p.inlineData);
          const base64Data = imagePart?.inlineData?.data;
          const mimeType = imagePart?.inlineData?.mimeType || "image/png";

          if (base64Data) {
            return {
              ...project,
              previewImage: `data:${mimeType};base64,${base64Data}`,
            };
          }
        } catch {
          // في حال عدم توفر رصيد صور مجاني، ننتقل تلقائياً للبديل بالأسفل
        }

        const encoded = encodeURIComponent(project.imagePrompt);
        return {
          ...project,
          previewImage: `https://pollinations.ai{encoded}?width=800&height=600&nologo=true&seed=${Date.now() + index}`,
        };
      })
    );

    return NextResponse.json({
      objectName: data.objectName,
      projects: projectsWithImages,
    });
  } catch (error: any) {
    console.error("Gemini Error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to process image" },
      { status: 500 }
    );
  }
}

