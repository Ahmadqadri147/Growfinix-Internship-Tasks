import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, LayoutGrid, Zap, Shield, Play, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-32 h-32 bg-gradient-primary/20 rounded-full blur-3xl ${i % 2 === 0 ? '-top-16 -left-16' : 'bottom-0 right-0'}`}
          animate={{
            y: [0, -20, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 6 + (i * 2),
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();

  const scrollToGenerate = () => {
    navigate('/generate');
  };

  return (
    <div className="min-h-screen bg-gradient-dark overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-dark">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Floating Elements */}
      <FloatingElements />

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">AI-Powered Image Generation</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              Transform Your Ideas
              <br />
              <span className="gradient-text">Into Stunning Visuals</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
              Create professional-quality AI images with professional-grade controls. 
              From photorealistic portraits to fantasy landscapes - the possibilities are endless.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToGenerate}
                className="px-8 py-4 gradient-button flex items-center gap-3 text-lg"
              >
                Start Creating
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/gallery')}
                className="px-8 py-4 glass-button flex items-center gap-3 text-lg"
              >
                <LayoutGrid className="w-5 h-5" />
                View Gallery
              </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { value: '100%', label: 'High Quality' },
                { value: 'Instant', label: 'Generation' },
                { value: 'Unlimited', label: 'Possibilities' },
                { value: 'Secure', label: 'Privacy' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + (index * 0.1) }}
                  className="text-center"
                >
                  <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Preview */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Professional-Grade <span className="gradient-text">Controls</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Fine-tune every aspect of your AI-generated images with advanced options
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: 'Style Selection',
                desc: 'From photorealistic to anime, cyberpunk to fantasy - choose your perfect style'
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Lighting Control',
                desc: 'Studio, natural, golden hour, neon - set the perfect mood for your image'
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Texture Options',
                desc: 'Smooth, rough, metallic, wood - create realistic surfaces and materials'
              },
              {
                icon: <LayoutGrid className="w-6 h-6" />,
                title: 'Camera Angles',
                desc: 'Portrait, close-up, wide, bird eye - perfect composition every time'
              },
              {
                icon: <Moon className="w-6 h-6" />,
                title: 'Background Settings',
                desc: 'Forest, mountains, space, city - set your scene exactly as imagined'
              },
              {
                icon: <Play className="w-6 h-6" />,
                title: 'Color Palettes',
                desc: 'Create mood and atmosphere with curated color combinations'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 hover:scale-105 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-primary/20 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 gradient-text">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="generate-section" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Create <span className="gradient-text">Masterpieces?</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of creators using AI to bring their visions to life
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToGenerate}
              className="px-10 py-4 gradient-button flex items-center gap-3 text-lg mx-auto"
            >
              Start Generating Now
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;