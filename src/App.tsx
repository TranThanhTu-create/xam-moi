import React, { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import { Button, Card } from '@/components/ui';
import { Upload, Camera, Sparkles, ArrowRight, CheckCircle2, Loader2, AlertCircle, Image as ImageIcon, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeImage, simulateLipTattoo, generateLipImage } from '@/services/gemini';

type Step = 'landing' | 'upload' | 'analyzing' | 'results' | 'lead-form' | 'success' | 'generate';

interface AnalysisResult {
  analysis: string;
  issues: string[];
  recommendation: string;
}

interface SimulationResult {
  color: string;
  image: string;
  name: string;
}

export default function App() {
  const [step, setStep] = useState<Step>('landing');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadCity, setLeadCity] = useState('');
  
  // Generation State
  const [genPrompt, setGenPrompt] = useState('');
  const [genSize, setGenSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setStep('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!selectedImage) return;
    setStep('analyzing');

    try {
      // 1. Analyze
      const analyzeData = await analyzeImage(selectedImage);
      setAnalysis(analyzeData);

      // 2. Start Simulations (Async/Parallel)
      setIsSimulating(true);
      setStep('results');
      
      const colors = [
        { name: 'Cam San Hô', color: 'coral orange', hex: '#FF7F50' },
        { name: 'Đỏ Ruby', color: 'ruby red', hex: '#E0115F' },
        { name: 'Hồng Baby', color: 'soft baby pink', hex: '#F4C2C2' }
      ];

      const simPromises = colors.map(async (c) => {
        try {
          const image = await simulateLipTattoo(selectedImage, c.color, c.name);
          if (image) {
            setSimulations(prev => [...prev, { name: c.name, color: c.hex, image }]);
          }
        } catch (err) {
          console.error('Sim failed for', c.name, err);
        }
      });

      await Promise.all(simPromises);
      setIsSimulating(false);

    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra khi phân tích. Vui lòng thử lại.');
      setStep('upload');
    }
  };

  const handleGenerate = async () => {
    if (!genPrompt) return;
    setIsGenerating(true);
    try {
      const image = await generateLipImage(genPrompt, genSize);
      setGeneratedImage(image);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Không thể tạo ảnh. Vui lòng thử lại (và đảm bảo bạn đã chọn API Key nếu được yêu cầu).');
    } finally {
      setIsGenerating(false);
    }
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: leadName, phone: leadPhone, city: leadCity }),
      });
      setStep('success');
    } catch (error) {
      alert('Lỗi gửi thông tin. Vui lòng thử lại.');
    }
  };

  return (
    <Layout>
      <AnimatePresence mode="wait">
        
        {/* LANDING PAGE */}
        {step === 'landing' && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-4 py-8 space-y-8"
          >
            <div className="text-center space-y-4">
              <span className="inline-block px-3 py-1 bg-pink-100 text-[#D45D79] rounded-full text-xs font-bold tracking-wider uppercase">
                AI Beauty Technology
              </span>
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                Phân Tích & <br/>
                <span className="text-[#D45D79]">Mô Phỏng Xăm Môi</span>
              </h1>
              <p className="text-gray-600 text-lg">
                Khám phá dáng môi và màu môi hoàn hảo của bạn chỉ trong 30 giây với công nghệ AI tiên tiến.
              </p>
            </div>

            {/* UPLOAD AREA */}
            <div 
              className="border-2 border-dashed border-pink-200 rounded-2xl bg-pink-50/50 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-pink-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-[#D45D79] mb-4">
                <Camera size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">Tải ảnh gương mặt</h3>
              <p className="text-gray-500 text-sm mb-4">Chụp rõ khuôn mặt để AI phân tích tốt nhất</p>
              <Button 
                className="shadow-pink-200 shadow-lg pointer-events-none"
              >
                Chụp ảnh ngay <ArrowRight size={20} />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-pink-50">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-[#D45D79]">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Phân tích</h3>
                  <p className="text-sm text-gray-500">Đánh giá tình trạng & gợi ý màu</p>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              
              <Button 
                variant="secondary"
                className="w-full"
                onClick={() => setStep('generate')}
              >
                <Wand2 size={18} /> Tạo mẫu môi mới (AI)
              </Button>

              <p className="text-center text-xs text-gray-400 mt-3">
                Miễn phí 100% • Bảo mật thông tin
              </p>
            </div>
          </motion.div>
        )}

        {/* GENERATE PAGE */}
        {step === 'generate' && (
          <motion.div
            key="generate"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-4 py-8 space-y-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setStep('landing')} className="text-gray-500 hover:text-gray-800">
                ← Quay lại
              </button>
              <h2 className="text-xl font-bold">Tạo mẫu môi AI</h2>
            </div>

            <Card>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả mẫu môi bạn muốn</label>
                  <textarea 
                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#D45D79] outline-none min-h-[100px]"
                    placeholder="Ví dụ: Đôi môi căng mọng màu đỏ cherry, bóng nhẹ, phong cách Hàn Quốc..."
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chất lượng ảnh</label>
                  <div className="flex gap-2">
                    {(['1K', '2K', '4K'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setGenSize(s)}
                        className={`px-4 py-2 rounded-lg border ${genSize === s ? 'bg-pink-50 border-[#D45D79] text-[#D45D79]' : 'border-gray-200 text-gray-600'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleGenerate}
                  disabled={isGenerating || !genPrompt}
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
                  {isGenerating ? 'Đang tạo...' : 'Tạo hình ảnh'}
                </Button>
              </div>
            </Card>

            {generatedImage && (
              <div className="rounded-xl overflow-hidden shadow-lg border border-gray-100">
                <img src={generatedImage} alt="Generated Lip" className="w-full" />
                <div className="p-3 bg-white">
                  <p className="text-sm font-medium text-gray-900">Kết quả tạo bởi AI</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* UPLOAD PREVIEW */}
        {step === 'upload' && selectedImage && (
          <motion.div 
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-8 space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Kiểm tra ảnh</h2>
              <p className="text-gray-500">Đảm bảo ảnh rõ nét và đủ sáng</p>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
              <img src={selectedImage} alt="Preview" className="w-full" />
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full py-4 text-lg"
                onClick={startAnalysis}
              >
                Phân tích ngay <Sparkles size={18} />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => {
                  setSelectedImage(null);
                  setStep('landing');
                }}
              >
                Chọn ảnh khác
              </Button>
            </div>
          </motion.div>
        )}

        {/* ANALYZING */}
        {step === 'analyzing' && (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6"
          >
            <div className="relative">
              <div className="w-20 h-20 border-4 border-pink-100 border-t-[#D45D79] rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="text-[#D45D79] animate-pulse" size={24} />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Đang phân tích...</h3>
              <p className="text-gray-500 mt-2">AI đang quét cấu trúc và màu sắc môi của bạn</p>
            </div>
            <div className="w-full max-w-xs bg-gray-100 rounded-full h-2 overflow-hidden">
              <motion.div 
                className="h-full bg-[#D45D79]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* RESULTS */}
        {step === 'results' && analysis && (
          <motion.div 
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-6 space-y-8 pb-24"
          >
            {/* Analysis Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-500" />
                <h2 className="text-xl font-bold text-gray-900">Kết quả phân tích</h2>
              </div>
              
              <Card className="bg-gradient-to-br from-white to-pink-50/50">
                <p className="text-gray-700 leading-relaxed">
                  {analysis.analysis}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {analysis.issues?.map((issue, i) => (
                    <span key={i} className="px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full border border-red-100">
                      {issue}
                    </span>
                  ))}
                </div>
              </Card>

              <div className="bg-[#FFF5F7] p-4 rounded-xl border border-[#FDF2F4]">
                <h4 className="font-semibold text-[#D45D79] mb-2 text-sm uppercase tracking-wide">Giải pháp đề xuất</h4>
                <p className="text-gray-700 font-medium">{analysis.recommendation}</p>
              </div>
            </div>

            {/* Simulation Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Mô phỏng sau xăm
                {isSimulating && <Loader2 className="animate-spin text-[#D45D79]" size={16} />}
              </h2>
              
              <div className="grid grid-cols-1 gap-6">
                {simulations.map((sim, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.2 }}
                    className="space-y-2"
                  >
                    <div className="relative rounded-xl overflow-hidden shadow-md bg-gray-100 aspect-[4/3]">
                      <img src={sim.image} alt={sim.name} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-3 flex items-center justify-between">
                        <span className="font-bold text-gray-800">{sim.name}</span>
                        <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: sim.color }} />
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {simulations.length === 0 && isSimulating && (
                   <div className="text-center py-8 text-gray-400">
                     <p>Đang tạo hình ảnh mô phỏng...</p>
                   </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
              <div className="max-w-md mx-auto">
                <Button 
                  className="w-full shadow-xl shadow-pink-200 animate-bounce"
                  onClick={() => setStep('lead-form')}
                >
                  Nhận tư vấn chi tiết <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* LEAD FORM */}
        {step === 'lead-form' && (
          <motion.div 
            key="lead-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <Card className="w-full max-w-sm relative">
              <button 
                onClick={() => setStep('results')}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
              
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-[#D45D79] mx-auto mb-3">
                  <Sparkles size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Nhận tư vấn miễn phí</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Chuyên gia sẽ liên hệ tư vấn chi tiết về lộ trình và báo giá ưu đãi cho bạn.
                </p>
              </div>

              <form onSubmit={submitLead} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#D45D79] focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                    placeholder="Nhập họ tên của bạn"
                    value={leadName}
                    onChange={e => setLeadName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input 
                    required
                    type="tel" 
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#D45D79] focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                    placeholder="0912 xxx xxx"
                    value={leadPhone}
                    onChange={e => setLeadPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố (Tùy chọn)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#D45D79] focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                    placeholder="Hà Nội, TP.HCM..."
                    value={leadCity}
                    onChange={e => setLeadCity(e.target.value)}
                  />
                </div>
                
                <Button type="submit" className="w-full mt-2">
                  Đăng ký tư vấn ngay
                </Button>
                <p className="text-xs text-center text-gray-400">
                  Chúng tôi cam kết bảo mật thông tin của bạn.
                </p>
              </form>
            </Card>
          </motion.div>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center space-y-6"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Đăng ký thành công!</h2>
            <p className="text-gray-600 max-w-xs mx-auto">
              Cảm ơn <strong>{leadName}</strong>. Chuyên gia của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Quay lại trang chủ
            </Button>
          </motion.div>
        )}

      </AnimatePresence>
    </Layout>
  );
}
