import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Zap, Users, Layers, Target, Globe, Code, Rocket } from 'lucide-react';
import Navbar from '../components/Navbar';

const features = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'AI-Powered Generation',
    description: 'Powered by cutting-edge Hugging Face Inference API for stunning, realistic results',
    color: 'purple'
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Professional Controls',
    description: 'Fine-tune every aspect from style and lighting to camera angles and textures',
    color: 'blue'
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: 'Multiple Styles',
    description: 'From photorealistic to anime, cyberpunk to fantasy - explore endless possibilities',
    color: 'cyan'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Secure & Private',
    description: 'Your API keys are never exposed. We handle secure communication between frontend and backend',
    color: 'green'
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Community Driven',
    description: 'Built by developers for developers. Clean, modular, and extensible codebase',
    color: 'pink'
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'High Performance',
    description: 'Optimized for speed and efficiency with responsive design for all devices',
    color: 'orange'
  }
];

const stack = [
  { name: 'React.js', icon: <Code className="w-8 h-8" /> },
  { name: 'Tailwind CSS', icon: <Layers className="w-8 h-8" /> },
  { name: 'Framer Motion', icon: <Sparkles className="w-8 h-8" /> },
  { name: 'Node.js', icon: <Rocket className="w-8 h-8" /> },
  { name: 'Express.js', icon: <Globe className="w-8 h-8" /> },
  { name: 'Hugging Face SDXL', icon: <Zap className="w-8 h-8" /> }
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-dark pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Production Ready</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            About <span className="gradient-text">AI Image Generation Studio</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            A complete, production-ready AI image generation platform built with cutting-edge technologies.
            From professional controls to responsive design, we provide everything you need to create stunning AI art.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (index * 0.1) }}
              className="glass rounded-2xl p-6 hover:scale-105 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-primary/20 flex items-center justify-center mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 gradient-text">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-8 mb-16"
        >
          <h2 className="text-2xl font-bold text-center mb-8 gradient-text">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stack.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + (index * 0.05) }}
                className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white/10 transition-colors cursor-default"
              >
                <div className={`text-4xl text-gradient-primary`}>
                  {item.icon}
                </div>
                <span className="text-sm font-medium text-gray-300">{item.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Architecture */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-center mb-8 gradient-text">Architecture</h2>
          <div className="glass rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400">Frontend</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span>React.js 18 with hooks and context</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span>Tailwind CSS for responsive design</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span>Framer Motion for animations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span>React Router for navigation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span>Axios for API calls</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-400">Backend</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <span>Node.js with Express.js framework</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <span>Hugging Face Inference API integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <span>REST API with proper validation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <span>Rate limiting and security middleware</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <span>Environment-based configuration</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-center mb-8 gradient-text">Security Features</h2>
          <div className="glass rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Shield className="w-8 h-8" />, title: 'API Key Security', desc: 'Never exposed to frontend. Secure communication only.' },
                { icon: <Layers className="w-8 h-8" />, title: 'Input Validation', desc: 'All inputs validated before processing.' },
                { icon: <Zap className="w-8 h-8" />, title: 'Rate Limiting', desc: 'Prevents abuse and ensures fair usage.' },
                { icon: <Globe className="w-8 h-8" />, title: 'CORS Protection', desc: 'Configured for secure cross-origin requests.' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + (index * 0.1) }}
                  className="text-center p-6 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary/20 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-white">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="text-center"
        >
          <p className="text-gray-400">
            Built with ❤️ by Growfinix using modern web technologies
          </p>
          <p className="text-sm text-gray-500 mt-2">
            © 2024 AI Image Generation Studio. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;