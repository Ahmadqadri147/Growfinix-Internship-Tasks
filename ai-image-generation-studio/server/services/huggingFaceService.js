const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

class HuggingFaceService {
  constructor() {
    this.apiToken = config.huggingface.apiToken;
    this.model = config.huggingface.model;
    // Use the new router endpoint (api-inference.huggingface.co is deprecated for some models)
    this.baseURL = 'https://router.huggingface.co/hf-inference/models';
  }

  async generateImage(prompt, options = {}) {
    try {
      const startTime = Date.now();
      const n = parseInt(options.n) || 1;

      const width = this.getWidth(options.imageSize);
      const height = this.getHeight(options.imageSize);

      // Generate n images sequentially (HF API generates one at a time)
      const images = [];
      for (let idx = 0; idx < n; idx++) {
        const seed = options.seed ? (parseInt(options.seed) + idx) : Math.floor(Math.random() * 1000000);

        const responseData = await this.callInferenceAPI(prompt, {
          ...options,
          width,
          height,
          seed
        });

        // Save image binary to file
        const filename = `hf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
        const storageDir = path.resolve(config.storage.path);
        await fs.mkdir(storageDir, { recursive: true });
        const filePath = path.join(storageDir, filename);
        await fs.writeFile(filePath, responseData);

        const generationTime = Date.now() - startTime;
        images.push({
          url: `/generated_images/${filename}`,
          generationTime,
          seed
        });
      }

      return {
        success: true,
        images,
        usage: {},
        model: this.model
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async callInferenceAPI(prompt, options, attempt = 1) {
    const maxAttempts = 10;
    const url = `${this.baseURL}/${this.model}`;

    const body = {
      inputs: prompt,
      parameters: {
        width: options.width || 1024,
        height: options.height || 1024
      }
    };

    // Only add optional parameters if they have valid values
    if (options.numInferenceSteps && options.numInferenceSteps > 0) {
      body.parameters.num_inference_steps = options.numInferenceSteps;
    }
    if (options.guidanceScale && options.guidanceScale > 0) {
      body.parameters.guidance_scale = options.guidanceScale;
    }
    if (options.seed) {
      body.parameters.seed = options.seed;
    }
    if (options.negativePrompt) {
      body.parameters.negative_prompt = options.negativePrompt;
    }

    try {
      console.log(`[HuggingFace] Generating image with model: ${this.model}`);
      console.log(`[HuggingFace] Prompt: ${prompt.substring(0, 80)}...`);

      const response = await axios.post(url, body, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
          'Accept': 'image/png'
        },
        responseType: 'arraybuffer',
        timeout: 120000 // 2 minutes timeout
      });

      console.log(`[HuggingFace] Image generated successfully (${response.data.length} bytes)`);
      return response.data;
    } catch (error) {
      // Handle model loading status (503)
      if (error.response && error.response.status === 503 && attempt <= maxAttempts) {
        let waitTime = 10000;
        try {
          const errorText = Buffer.from(error.response.data).toString('utf8');
          const errorJson = JSON.parse(errorText);
          if (errorJson.estimated_time) {
            waitTime = Math.min(errorJson.estimated_time * 1000, 30000);
          }
          console.log(`[HuggingFace] Model is loading: ${errorJson.error || 'warming up'}`);
        } catch (e) {
          // ignore parse errors
        }
        console.log(`[HuggingFace] Waiting ${waitTime / 1000}s for model to load (Attempt ${attempt}/${maxAttempts})...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.callInferenceAPI(prompt, options, attempt + 1);
      }

      // Handle 422 (unsupported parameters) - retry without optional params
      if (error.response && error.response.status === 422 && attempt === 1) {
        console.log('[HuggingFace] Got 422, retrying with minimal parameters...');
        const minimalBody = { inputs: prompt };
        try {
          const response = await axios.post(url, minimalBody, {
            headers: {
              'Authorization': `Bearer ${this.apiToken}`,
              'Content-Type': 'application/json',
              'Accept': 'image/png'
            },
            responseType: 'arraybuffer',
            timeout: 120000
          });
          console.log(`[HuggingFace] Image generated with minimal params (${response.data.length} bytes)`);
          return response.data;
        } catch (retryError) {
          throw retryError;
        }
      }

      throw error;
    }
  }

  buildPrompt(originalPrompt, options) {
    let combinedPrompt = originalPrompt;

    if (options.style) {
      combinedPrompt = `${options.style}, ${combinedPrompt}`;
    }
    if (options.lighting) {
      combinedPrompt = `${combinedPrompt}, ${options.lighting} lighting`;
    }
    if (options.texture) {
      combinedPrompt = `${combinedPrompt}, ${options.texture} texture`;
    }
    if (options.colorPalette) {
      combinedPrompt = `${combinedPrompt}, ${options.colorPalette} color palette`;
    }
    if (options.background) {
      combinedPrompt = `${combinedPrompt}, ${options.background} background`;
    }
    if (options.cameraAngle) {
      combinedPrompt = `${combinedPrompt}, ${options.cameraAngle} camera angle`;
    }
    // Don't append negativePrompt to the main prompt - it's handled as a parameter
    return combinedPrompt;
  }

  getWidth(imageSize) {
    const sizeMap = {
      '256x256': 256,
      '512x512': 512,
      '1024x1024': 1024,
      '1024x1792': 1024,
      '1792x1024': 1792,
      '1024x768': 1024,
      '768x1024': 768
    };
    return sizeMap[imageSize] || 1024;
  }

  getHeight(imageSize) {
    const sizeMap = {
      '256x256': 256,
      '512x512': 512,
      '1024x1024': 1024,
      '1792x1024': 1792,
      '1024x768': 768,
      '768x1024': 1024
    };
    return sizeMap[imageSize] || 1024;
  }

  handleError(error) {
    console.error('[HuggingFace] Service Error:', error.message);
    let errorMessage = 'An error occurred while generating the image';
    let statusCode = 500;

    if (error.response) {
      statusCode = error.response.status;
      try {
        const errorText = Buffer.from(error.response.data).toString('utf8');
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch (e) {
        errorMessage = `HTTP error ${statusCode}`;
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. The model may be loading - please try again.';
    } else {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: `Hugging Face Error (${statusCode})`,
      message: errorMessage
    };
  }
}

module.exports = new HuggingFaceService();
