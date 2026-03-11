import { GoogleGenAI } from "@google/genai";
import { AspectRatio, CameraAngle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a DPA/Marketing image based on an input image and a prompt.
 * Uses gemini-2.5-flash-image for image editing/variation capabilities.
 * Returns both the generated image URL and the full prompt used.
 */
export const generateMarketingImage = async (
  base64Image: string,
  secondaryBase64Image: string | null,
  prompt: string,
  aspectRatio: AspectRatio,
  destylize: boolean,
  zoomOut: boolean,
  cameraAngle: CameraAngle
): Promise<{ imageUrl: string; fullPrompt: string }> => {
  try {
    // Clean base64 strings
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    
    const parts: any[] = [
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64,
        },
      }
    ];

    let imageInstructions = "The first image is the MAIN PRODUCT.";

    if (secondaryBase64Image) {
      const cleanSecondary = secondaryBase64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanSecondary,
        },
      });
      imageInstructions += " The second image is a SECONDARY ELEMENT (prop, decoration, or logo).";
    }

    let styleInstructions = "";
    // Special handling for 'Nagyteszt' grid generation
    const isGridRequest = prompt.includes('3x3 GRID') || prompt.includes('contact sheet');

    if (destylize && !isGridRequest) {
      styleInstructions = `
        STYLE: "Destylized" / Authentic / Raw.
        - Do NOT create a perfect studio shot.
        - The lighting should be natural, slightly imperfect (e.g., window light, dappled sun, or typical indoor lighting).
        - The environment should look "lived-in" and real, with some everyday clutter or natural disarray appropriate to the context.
        - Avoid perfect symmetry.
        - The image should resemble a high-quality user review photo or a candid lifestyle snapshot rather than a magazine ad.
      `;
    } else if (!isGridRequest) {
      styleInstructions = `
        STYLE: Professional Product Advertisement.
        - Perfect commercial photography lighting.
        - Clean, high-resolution look.
        - Aesthetically pleasing composition.
        - Focal point clearly on the product.
      `;
    }

    let compositionInstructions = "";
    
    // Zoom/Distance Logic
    if (zoomOut && !isGridRequest) {
      compositionInstructions += `
        DISTANCE: Wide shot / Distant view. 
        - The product should appear smaller in the frame (occupying roughly 20-30% of the image area).
        - Show significantly more of the surrounding environment/background.
        - Create a sense of spaciousness around the item.
        - DO NOT cut off the product edges.
      `;
    } else if (!isGridRequest) {
      compositionInstructions += `
        DISTANCE: Standard product photography framing. 
        - The product should be the dominant subject, filling a significant portion of the frame.
      `;
    }

    // Camera Angle Logic - Strengthened
    // Skip specific angle instructions if we are doing a grid test, as the grid implies various angles/styles
    if (!isGridRequest) {
      let angleText = "";
      switch (cameraAngle) {
        case 'low':
          angleText = `
          CRITICAL CAMERA ANGLE: LOW ANGLE / HERO SHOT. 
          - The camera must be placed BELOW the product, looking UP.
          - This should make the product look imposing, grand, and monumental.
          - The horizon line should be very low in the frame.
          - Do NOT shoot from eye level.
          `;
          break;
        case 'front':
          angleText = `
          CRITICAL CAMERA ANGLE: STRAIGHT-ON / EYE-LEVEL.
          - The camera must be perfectly parallel to the product.
          - No tilt up or down. 
          - Flat perspective, geometric composition.
          - The horizon line (table edge) must be perfectly horizontal.
          `;
          break;
        case 'high':
          angleText = `
          CRITICAL CAMERA ANGLE: HIGH ANGLE / 3/4 VIEW.
          - The camera is placed above the product, looking down at approximately 30-45 degrees.
          - This is the standard "tabletop" product photography view.
          - Show the top surface of the table/background clearly.
          `;
          break;
      }
      compositionInstructions += `\n${angleText}`;
    }

    // Logic for "Labeled" style if prompt contains request for typography
    if (prompt.includes('typography overlay') || prompt.includes('Címkézett')) {
       compositionInstructions += `
       TEXT/TYPOGRAPHY INSTRUCTION:
       - Overlay clean, modern sans-serif text onto the image.
       - Use the product context or generic "MINERAL" / "ENERGY" labels if no specific text is provided.
       - Ensure text is legible against the background.
       `;
    }

    const fullPrompt = `
      Create a product image based on the input.
      
      Input Analysis:
      ${imageInstructions}
      
      Action: 
      1. Keep the MAIN PRODUCT from the first image unchanged in appearance (preserve text/labels on product) but place it in a new environment.
      2. If a SECONDARY ELEMENT is provided, incorporate it into the scene.
      
      Scene Description & Context: 
      ${prompt}
      
      ${styleInstructions}
      
      ${compositionInstructions}
    `;

    parts.push({ text: fullPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      },
    });

    // Iterate through parts to find the image
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return {
            imageUrl: `data:image/png;base64,${part.inlineData.data}`,
            fullPrompt: fullPrompt.trim()
          };
        }
      }
    }

    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Generates a Yerba Mate product shot with ingredients on a white background.
 */
export const generateYerbaProductShot = async (
  base64Image: string,
  description: string,
  aspectRatio: AspectRatio
): Promise<{ imageUrl: string; fullPrompt: string }> => {
  try {
    // Clean base64 strings
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    
    const parts: any[] = [
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64,
        },
      }
    ];

    const fullPrompt = `
      Create a professional product shot on a PURE WHITE background (RGB 255, 255, 255).
      
      Subject:
      The provided image is the MAIN PRODUCT (a 500g Yerba Mate bag, approx 15-20cm tall).
      CRITICAL: The product packaging, text, and logos MUST remain EXACTLY identical to the original image. Do not distort, blur, or change the packaging.
      
      IMPORTANT: DO NOT SHRINK OR RESIZE THE PRODUCT.
      - The product must occupy the EXACT SAME amount of space in the frame as it does in the original image.
      - STRICT CONSTRAINT: The product size must NOT be reduced by more than 5%.
      - Do not zoom out. Keep the framing tight on the product.
      - The product is the HERO.
      
      Composition:
      - Place the product in the center.
      - Arrange fresh ingredients mentioned in the description around the product.
      - Placement: Ingredients should be on the LEFT, RIGHT, and in FRONT of the product.
      - Scale: The ingredients must be realistic in size relative to the 15-20cm tall package.
      
      Ingredients Description:
      "${description}"
      
      Lighting & Style:
      - Soft, high-key studio lighting.
      - Soft, natural shadows on the white floor to ground the objects.
      - Sharp focus on the product and immediate ingredients.
      - Clean, fresh, and appetizing look.
    `;

    parts.push({ text: fullPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      },
    });

    // Iterate through parts to find the image
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return {
            imageUrl: `data:image/png;base64,${part.inlineData.data}`,
            fullPrompt: fullPrompt.trim()
          };
        }
      }
    }

    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Gemini API Error (Yerba):", error);
    throw error;
  }
};
