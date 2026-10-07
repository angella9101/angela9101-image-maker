import { ImageTaskRequest, ImageTool } from '../types';

export class PromptBuilder {
  static buildIdentityAndPreservationRules(task: ImageTaskRequest): string {
    if (task.identityLock === false) {
      return `IDENTITY_LOCK: DISABLED
Allow artistic style adjustments while maintaining basic character recognizability.`;
    }
    return `IDENTITY_LOCK: ENABLED
Preserve the primary subject's identity exactly.
Keep: same face shape, facial structure, eyes, nose, lips, jawline, skin tone, hairstyle (unless requested), and body proportions.
Do not beautify or alter facial anatomy unless explicitly requested.
Modify ONLY requested attributes. Leave unrelated regions intact.`;
  }

  static TOOL_PROMPTS: Record<ImageTool, (task: ImageTaskRequest) => string> = {
    GENERATE: () => `
TASK_TYPE: TEXT_TO_IMAGE

Create a new high-quality image according to the user's request.

Follow the requested:
- subject
- environment
- composition
- lighting
- visual style

Do not add unnecessary text.
`,

    COMPOSITE: () => `
TASK_TYPE: IMAGE_COMPOSITING

Use the SOURCE image as the primary scene.

Insert only the requested subject/object from the other provided image.

Preserve the SOURCE composition unless repositioning is requested.

Match:
- scale
- perspective
- camera angle
- lighting
- shadows
- depth
- sharpness
- color temperature

The result must appear naturally photographed as one scene.

Do not blend or merge the identities of two different people.
`,

    RESTORE: (task) => `
TASK_TYPE: PHOTO_RESTORATION

Restore the supplied photograph.

Repair where necessary:
- scratches
- stains
- dust
- tears
- fading
- mild blur
- damaged small regions

RESTORATION_STRENGTH:
${task.options?.strength || task.options?.restoreIntensity || 'medium'}

Preserve original:
- person
- facial identity
- pose
- clothing
- background
- historical character

Do not colorize.
Do not modernize.
`,

    UPSCALE: (task) => `
TASK_TYPE: IMAGE_ENHANCEMENT

Enhance perceived resolution and detail.

UPSCALE_TARGET:
${task.options?.scale || task.options?.upscaleFactor || '4x'}

Improve:
- edge clarity
- texture visibility
- overall sharpness

Preserve exact composition and identity.

Do not create new objects.
Do not alter facial anatomy.
Do not stylistically redesign the image.
`,

    COLORIZE: (task) => `
TASK_TYPE: PHOTO_COLORIZATION

Colorize the supplied monochrome photograph.

COLOR_STYLE:
${task.options?.colorStyle || task.options?.colorizeTone || 'natural'}

Preserve:
- facial identity
- facial structure
- pose
- clothing design
- objects
- background structure

Do not alter geometry.

Use plausible natural colors.

Do not claim historically uncertain colors are factual.
`,

    BACKGROUND_REMOVE: () => `
TASK_TYPE: BACKGROUND_ISOLATION

Preserve the complete foreground subject.

Remove or isolate only the background.

Pay special attention to:
- hair
- fine edges
- clothing boundaries

Do not modify the subject.

Return a clean isolated subject.

Use transparency when supported.
`,

    BACKGROUND_REPLACE: (task) => `
TASK_TYPE: BACKGROUND_REPLACEMENT

Replace only the current background with:

${task.options?.background || task.options?.bgReplaceType || task.userPrompt || 'clean studio backdrop'}

Keep the person unchanged.

Preserve:
- face
- hairstyle
- body shape
- clothing
- expression

Make lighting interaction natural.
`,

    OBJECT_REMOVE: (task) => `
TASK_TYPE: SEMANTIC_INPAINTING

Remove only:

${task.options?.target || task.userPrompt || 'the highlighted area'}

Reconstruct the hidden background naturally.

The selected area is the edit target.

Do not modify any unrelated area.

Preserve people, faces, clothing and composition outside the target.
`,

    SKIN_RETOUCH: (task) => `
TASK_TYPE: NATURAL_SKIN_RETOUCH

RETOUCH_LEVEL:
${task.options?.level || task.options?.skinRetouchIntensity || 'natural'}

Reduce only:
- acne
- temporary blemishes
- small unwanted spots
- excessive shine

Preserve:
- pores
- natural skin texture
- facial identity
- facial geometry
- age characteristics

Do not change:
eyes, nose, mouth, jawline, face width or skin tone.
`,

    STYLE_TRANSFER: (task) => `
TASK_TYPE: STYLE_TRANSFORMATION

TARGET_STYLE:
${task.options?.style || task.options?.styleType || 'watercolor'}

Transform the visual rendering style.

Preserve:
- main subject
- pose
- composition
- recognizable identity when Identity Lock is enabled

Do not add new people or objects unless requested.
`,

    SKETCH: (task) => `
TASK_TYPE: SKETCH_CONVERSION

Convert the supplied image into:

${task.options?.sketchType || task.options?.sketchMode || 'pencil sketch'}

Preserve:
- proportions
- pose
- recognizable features
- composition
`,

    SKETCH_COLOR: (task) => `
TASK_TYPE: SKETCH_COLORIZATION

Color the supplied drawing or sketch.

Preserve:
- original outlines
- character structure
- major shapes

COLOR_DIRECTION:
${task.userPrompt || 'natural harmonious colors'}

Do not unnecessarily redraw the composition.
`,

    STUDIO: (task) => `
TASK_TYPE: PROFESSIONAL_STUDIO_PORTRAIT

Use the supplied person as the identity reference.

STUDIO_STYLE:
${task.options?.studioStyle || task.options?.studioPreset || 'professional profile'}

FRAMING:
${task.options?.framing || task.options?.studioFraming || 'upper-body'}

BACKGROUND:
${task.options?.background || 'neutral studio backdrop'}

Create realistic professional portrait lighting.

IDENTITY:
Preserve original facial identity.

CLOTHING:
${
  task.options?.changeClothing
    ? task.options?.clothingPrompt
    : 'Keep the original clothing.'
}

Do not beautify or change age unless requested.
`,

    AGE_TRANSFORM: (task) => `
TASK_TYPE: FICTIONAL_AGE_TRANSFORMATION

CURRENT_AGE:
${task.options?.currentAge || 20}

TARGET_AGE:
${task.options?.targetAge || 50}

Create a plausible fictional visualization of the same person at the target age.

Preserve recognizable:
- eyes
- nose
- lips
- facial relationships
- identity

Adjust only plausible age-related features such as:
- skin texture
- facial volume
- wrinkles
- hair color
- hair density

Do not significantly change core facial geometry.

This is not a prediction of the person's real appearance.
`,

    POSTER: (task) => `
TASK_TYPE: POSTER_IMAGE

Create a professional poster composition.

STYLE:
${task.options?.posterStyle || 'modern'}

Use exactly the supplied text.

TITLE:
${task.options?.title || (task.options?.posterLayer as any)?.title || ''}

SUBTITLE:
${task.options?.subtitle || (task.options?.posterLayer as any)?.subtitle || ''}

BODY:
${task.options?.body || (task.options?.posterLayer as any)?.body || ''}

Do not invent extra copy.
Do not add random lettering.
Maintain clear visual hierarchy.
`,

    PASSPORT_GUIDE: () => `
TASK_TYPE: PASSPORT_GUIDE_PREVIEW

Align subject according to standard 3.5cm x 4.5cm passport photo dimensions.
Clean solid background.
Keep 100% facial identity.
`,
  };

  static buildToolPrompt(task: ImageTaskRequest): string {
    const base = this.buildIdentityAndPreservationRules(task);
    const toolFn = this.TOOL_PROMPTS[task.tool] || this.TOOL_PROMPTS.GENERATE;
    const toolInstruction = toolFn(task);

    return `
${base}

${toolInstruction}

USER REQUEST:
${task.userPrompt || 'No additional instruction.'}

OUTPUT:
Aspect ratio: ${task.aspectRatio || '1:1'}
Quality target: ${task.quality || '1K'}

Return the resulting image.
`.trim();
  }
}
