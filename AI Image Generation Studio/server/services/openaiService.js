const axios = require('axios');
const config = require('../config');

class OpenAIService {
  constructor() {
    this.apiKey = config.openai.apiKey;
    this.baseURL = 'https://api.openai.com/v1/images';
  }

  async generateImage(prompt, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/generations`,
        {
          model: config.openai.model,
          prompt: this.buildPrompt(prompt, options),
          n: options.n || 1,
          size: options.size || config.openai.defaultSize,
          quality: options.quality || 'standard',
          style: options.style || 'vivid'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 300000
        }
      );

      return {
        success: true,
        images: response.data.data.map(img => ({
          url: img.url,
          revisedPrompt: img.revised_prompt,
          size: img.size
        })),
        usage: response.data.usage,
        model: response.data.model
      };
    } catch (error) {
      return this.handleError(error);
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

    if (options.negativePrompt) {
      combinedPrompt = `${combinedPrompt}, negative: ${options.negativePrompt}`;
    }

    if (options.creativity) {
      combinedPrompt = `${combinedPrompt}, ${options.creativity} creativity level`;
    }

    return combinedPrompt;
  }

  handleError(error) {
    if (error.response) {
      const statusCode = error.response.status;

      switch (statusCode) {
        case 400:
          return {
            success: false,
            error: 'Bad Request',
            message: error.response.data.error?.message || 'Invalid request parameters'
          };
        case 401:
          return {
            success: false,
            error: 'Unauthorized',
            message: 'Invalid or missing API key'
          };
        case 403:
          return {
            success: false,
            error: 'Forbidden',
            message: 'You do not have permission to access this resource'
          };
        case 429:
          return {
            success: false,
            error: 'Rate Limit Exceeded',
            message: 'Too many requests. Please try again later.'
          };
        case 500:
        case 502:
        case 503:
          return {
            success: false,
            error: 'Server Error',
            message: 'OpenAI server is experiencing issues. Please try again later.'
          };
        default:
          return {
            success: false,
            error: `HTTP Error ${statusCode}`,
            message: error.response.data.error?.message || 'An unexpected error occurred'
          };
      }
    } else if (error.request) {
      return {
        success: false,
        error: 'No Response',
        message: 'No response from OpenAI API. Please check your internet connection.'
      };
    } else {
      return {
        success: false,
        error: 'Request Error',
        message: error.message || 'An error occurred while making the request'
      };
    }
  }

  async getModels() {
    try {
      const response = await axios.get(
        'https://api.openai.com/v1/models',
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        models: response.data.data
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

module.exports = new OpenAIService();