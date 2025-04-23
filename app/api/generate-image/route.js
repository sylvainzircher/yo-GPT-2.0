import { NextResponse } from "next/server";
import { saveImageGenUsage } from "@/libs/save-usage-imagegen";

export async function POST(req) {
  const cost_per_step = 0.00013;
  let cost;

  try {
    const formData = await req.formData();

    const prompt = formData.get("prompt");
    const initImage = formData.get("init_image");
    const cfgScale = formData.get("cfg_scale");
    const imageStrength = formData.get("image_strength");
    const imageID = formData.get("uid");

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREWORKS_API_KEY;

    const fireworksForm = new FormData();
    fireworksForm.append("prompt", prompt.trim());

    if (
      initImage &&
      typeof initImage === "object" &&
      "arrayBuffer" in initImage
    ) {
      fireworksForm.append(
        "init_image",
        new File([initImage], "init_image.jpg", {
          type: initImage.type || "image/jpeg",
        })
      );
    }

    fireworksForm.append("init_image_mode", "IMAGE_STRENGTH");
    fireworksForm.append(
      "image_strength",
      imageStrength ? Number(imageStrength) / 100 : 20
    );
    fireworksForm.append("cfg_scale", cfgScale ? Number(cfgScale) : 0.7);
    fireworksForm.append("seed", String(Math.floor(Math.random() * 100000)));
    fireworksForm.append("steps", 100);
    fireworksForm.append("safety_check", "true");

    let response;

    if (initImage) {
      response = await fetch(
        "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0/image_to_image",
        {
          method: "POST",
          headers: {
            Accept: "image/jpeg",
            Authorization: `Bearer ${apiKey}`,
          },
          body: fireworksForm,
        }
      );
    } else {
      response = await fetch(
        "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "image/jpeg",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ prompt }),
        }
      );
    }

    const billingHeader = response.headers.get("x-billing-information");
    if (billingHeader) {
      const billing = JSON.parse(billingHeader);
      cost = cost_per_step * Number(billing.num_steps);

      await saveImageGenUsage({
        uid: imageID,
        steps: billing.num_steps,
        cost: cost,
      });
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": "inline; filename=image.jpg",
      },
    });
  } catch (error) {
    console.error("Error in image generation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
