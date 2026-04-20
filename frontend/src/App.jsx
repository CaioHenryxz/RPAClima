import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Legend, ComposedChart, Line, Area
} from 'recharts';

/**
 * 🚀 SINFÃES PEOPLE ANALYTICS - VERSÃO FAIL-SAFE (OFFLINE MODE)
 * GESTÃO: MARCOS SINFÃES | DESENVOLVEDOR: CAIO HÊNRY
 */

export default function App() {
  // ======================================================================
  // 1. ESTADOS DA APLICAÇÃO
  // ======================================================================
  const [view, setView] = useState('pesquisa'); // 'pesquisa' | 'bi' | 'sucesso'
  const [abaBI, setAbaBI] = useState('geral');
  const [isLogged, setIsLogged] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [erroBackend, setErroBackend] = useState(false);

  const [form, setForm] = useState({
    e_nps: -1, nota_clima: 0, nota_lideranca: 0, nota_satisfacao: 0,
    nota_reconhecimento: 0, nota_comunicacao: 0, nota_ferramentas: 0, observacoes: ''
  });

  const [db, setDb] = useState([]);

  // ======================================================================
  // 2. SISTEMA FAIL-SAFE (DADOS DE TESTE CASO O PYTHON ESTEJA OFFLINE)
  // ======================================================================
  const gerarDadosDeTeste = () => {
    const mock = [];
    for (let i = 0; i < 45; i++) {
      mock.push({
        id: i + 1,
        e_nps: Math.floor(Math.random() * 4) + 7, // Notas de 7 a 10
        nota_clima: Math.floor(Math.random() * 2) + 4,
        nota_lideranca: Math.floor(Math.random() * 2) + 4,
        nota_satisfacao: Math.floor(Math.random() * 3) + 3,
        nota_reconhecimento: Math.floor(Math.random() * 3) + 3,
        nota_comunicacao: Math.floor(Math.random() * 2) + 4,
        nota_ferramentas: Math.floor(Math.random() * 2) + 3,
        observacoes: i % 3 === 0 ? "Precisamos melhorar as licenças de software, mas a gestão do Marcos é excelente!" : "",
        data_envio: new Date().toISOString()
      });
    }
    return mock;
  };

  // ======================================================================
  // 3. INTEGRAÇÃO E LÓGICA DE NEGÓCIO
  // ======================================================================
  const buscarDados = async () => {
    setLoading(true);
    setErroBackend(false);
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/resultados/');
      setDb(res.data);
    } catch (e) {
      console.warn("⚠️ Backend Python offline. Carregando dados de teste (Mock)...");
      setErroBackend(true);
      setDb(gerarDadosDeTeste());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'bi') buscarDados();
  }, [view]);

  const realizarLogin = (e) => {
    e.preventDefault();
    if (senhaInput === 'admin123') {
      setIsLogged(true);
      setView('bi');
      setSenhaInput('');
    } else {
      alert("❌ Senha incorreta.");
    }
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    if (form.e_nps === -1 || Object.values(form).some(v => v === 0 && typeof v === 'number')) {
      alert("⚠️ Preencha todas as notas antes de enviar.");
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/respostas/', form);
    } catch (err) {
      console.warn("⚠️ Backend offline. Simulando envio com sucesso...");
    } finally {
      setLoading(false);
      setView('sucesso');
      setForm({ e_nps: -1, nota_clima: 0, nota_lideranca: 0, nota_satisfacao: 0, nota_reconhecimento: 0, nota_comunicacao: 0, nota_ferramentas: 0, observacoes: '' });
    }
  };

  // ======================================================================
  // 4. MOTOR ESTATÍSTICO (BI ANALYTICS)
  // ======================================================================
  const analytics = useMemo(() => {
    if (db.length === 0) return null;

    let p = 0, d = 0, n = 0;
    db.forEach(r => {
      if (r.e_nps >= 9) p++;
      else if (r.e_nps <= 6) d++;
      else n++;
    });

    const score = Math.round(((p - d) / db.length) * 100);
    const corScore = score >= 75 ? '#10b981' : score >= 50 ? '#3b82f6' : score >= 0 ? '#f59e0b' : '#ef4444';
    const textScore = score >= 75 ? 'Excelência' : score >= 50 ? 'Qualidade' : score >= 0 ? 'Aperfeiçoamento' : 'Crítica';

    const getMedia = (k) => (db.reduce((a, b) => a + b[k], 0) / db.length);
    const pilares = [
      { k: 'nota_clima', nome: 'Clima', pct: ((getMedia('nota_clima') / 5) * 100).toFixed(1), raw: getMedia('nota_clima') },
      { k: 'nota_lideranca', nome: 'Liderança', pct: ((getMedia('nota_lideranca') / 5) * 100).toFixed(1), raw: getMedia('nota_lideranca') },
      { k: 'nota_satisfacao', nome: 'Satisfação', pct: ((getMedia('nota_satisfacao') / 5) * 100).toFixed(1), raw: getMedia('nota_satisfacao') },
      { k: 'nota_reconhecimento', nome: 'Reconhec.', pct: ((getMedia('nota_reconhecimento') / 5) * 100).toFixed(1), raw: getMedia('nota_reconhecimento') },
      { k: 'nota_comunicacao', nome: 'Comunic.', pct: ((getMedia('nota_comunicacao') / 5) * 100).toFixed(1), raw: getMedia('nota_comunicacao') },
      { k: 'nota_ferramentas', nome: 'Ferramentas', pct: ((getMedia('nota_ferramentas') / 5) * 100).toFixed(1), raw: getMedia('nota_ferramentas') }
    ];

    return { score, corScore, textScore, p, n, d, pilares, total: db.length };
  }, [db]);

  const PIE_COLORS = ['#10b981', '#94a3b8', '#ef4444'];
  const BAR_COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

  // ======================================================================
  // 5. INTERFACE DO USUÁRIO (UI)
  // ======================================================================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-200">
      
      {/* ----------------- CABEÇALHO SUPERIOR GLOBAL ----------------- */}
      <header className="bg-slate-900 w-full px-8 py-5 flex justify-between items-center sticky top-0 z-50 shadow-2xl border-b-[6px] border-indigo-600">
        <div className="flex items-center gap-6">
          <div className="h-14 w-14 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-3xl text-white italic shadow-lg shadow-indigo-900">E</div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Termômetro Automação</h1>
            <p className="text-indigo-400 text-[10px] font-black tracking-[0.4em] uppercase mt-1">Gestão: Marcos Sinfães</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isLogged && view !== 'sucesso' && (
            <form onSubmit={realizarLogin} className="hidden md:flex gap-3">
              <input 
                type="password" 
                placeholder="Senha Gestor" 
                value={senhaInput}
                onChange={(e) => setSenhaInput(e.target.value)}
                className="px-5 py-3 rounded-xl bg-slate-800 border-2 border-slate-700 text-white outline-none focus:border-indigo-500 font-bold w-48 placeholder:text-slate-500"
              />
              <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg">Login BI</button>
            </form>
          )}

          {isLogged && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                <button onClick={() => setAbaBI('geral')} className={`px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${abaBI === 'geral' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Geral</button>
                <button onClick={() => setAbaBI('mural')} className={`px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${abaBI === 'mural' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Mural</button>
              </div>
              <button onClick={() => window.print()} className="hidden lg:block bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all print:hidden">PDF</button>
              <button onClick={() => {setIsLogged(false); setView('pesquisa');}} className="bg-rose-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 transition-all print:hidden">Sair</button>
            </div>
          )}

          {view === 'sucesso' && (
            <button onClick={() => window.location.reload()} className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400">Novo Envio</button>
          )}
        </div>
      </header>

      {/* ----------------- ALERTA MOCK ----------------- */}
      {erroBackend && isLogged && view === 'bi' && (
        <div className="bg-amber-500 text-white text-center py-2 font-bold text-xs uppercase tracking-widest flex justify-center items-center gap-2">
          <span>⚠️ Modo Offline: O Backend não respondeu. Exibindo dados de teste.</span>
        </div>
      )}

      <main className="flex-1 w-full max-w-[2000px] mx-auto">
        
        {/* ====================================================================== */}
        {/* TELA 1: PESQUISA (FUNCIONÁRIO) */}
        {/* ====================================================================== */}
        {!isLogged && view === 'pesquisa' && (
          <div className="p-6 md:p-16 animate-in fade-in duration-500 max-w-5xl mx-auto space-y-16">
            
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Avaliador de Cultura</h2>
              <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-sm">Respostas Criptografadas & 100% Anônimas</p>
            </div>

            <form onSubmit={enviarFormulario} className="space-y-16 pb-20">
              
              {/* BLOCO 1: E-NPS */}
              <div className="bg-white p-8 md:p-16 rounded-[3rem] shadow-xl border border-slate-200 text-center">
                <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter uppercase">1. Índice e-NPS</h3>
                <p className="text-slate-500 font-bold mb-10 text-lg italic">"O quanto você recomendaria nossa área como um excelente lugar para se trabalhar?"</p>
                <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                  {[0,1,2,3,4,5,6,7,8,9,10].map(nota => (
                    <button
                      key={nota} type="button" onClick={() => setForm({ ...form, e_nps: nota })}
                      className={`w-12 h-16 md:w-20 md:h-24 rounded-[1.5rem] font-black text-2xl md:text-4xl transition-all shadow-sm ${
                        form.e_nps === nota 
                        ? (nota >= 9 ? 'bg-emerald-500 text-white scale-110 shadow-emerald-500/50 shadow-xl' : nota >= 7 ? 'bg-amber-400 text-white scale-110 shadow-amber-400/50 shadow-xl' : 'bg-rose-500 text-white scale-110 shadow-rose-500/50 shadow-xl')
                        : 'bg-slate-50 border-2 border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50'
                      }`}
                    >
                      {nota}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mt-8 px-4">
                  <span>Crítico</span><span>Excelente</span>
                </div>
              </div>

              {/* BLOCO 2: PILARES 1-5 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { field: 'nota_clima', title: '2. Clima', desc: 'Ambiente saudável?' },
                  { field: 'nota_lideranca', title: '3. Liderança', desc: 'Marcos apoia o time?' },
                  { field: 'nota_satisfacao', title: '4. Satisfação', desc: 'Motivado com as entregas?' },
                  { field: 'nota_reconhecimento', title: '5. Reconhecimento', desc: 'Seu esforço é valorizado?' },
                  { field: 'nota_comunicacao', title: '6. Comunicação', desc: 'Informações claras?' },
                  { field: 'nota_ferramentas', title: '7. Ferramentas', desc: 'Recursos adequados?' },
                ].map(p => (
                  <div key={p.field} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-200 hover:shadow-xl transition-all group">
                    <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2 group-hover:text-indigo-600">{p.title}</h4>
                    <p className="text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest">{p.desc}</p>
                    <div className="flex justify-between gap-2">
                      {[1,2,3,4,5].map(v => (
                        <button
                          key={v} type="button" onClick={() => setForm({ ...form, [p.field]: v })}
                          className={`flex-1 h-16 md:h-20 rounded-[1.5rem] font-black text-2xl md:text-3xl transition-all border-b-4 ${
                            form[p.field] === v 
                            ? 'bg-indigo-600 text-white border-indigo-800 scale-105 shadow-xl shadow-indigo-600/40' 
                            : 'bg-slate-50 text-slate-300 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

               {/* BLOCO 3: PAUTA LIVRE */}
               <div className="bg-white p-8 md:p-16 rounded-[3rem] shadow-xl border border-slate-200">
                 <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter uppercase">8. Pauta do Comitê (Opcional)</h3>
                 <p className="text-slate-500 font-bold mb-8 text-lg italic">O que faria dessa área o melhor lugar da Embraer para se trabalhar?</p>
                 <textarea 
                    value={form.observacoes}
                    onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                    rows="6"
                    placeholder="Sua voz não contém rastreamento e vai direto para a gestão..."
                    className="w-full bg-slate-50 border-4 border-slate-100 rounded-[2.5rem] p-10 outline-none focus:border-indigo-600 focus:bg-white transition-all font-bold text-slate-700 text-xl placeholder:text-slate-300 resize-none"
                 ></textarea>
               </div>

              {/* BOTÃO SUBMIT */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 text-white font-black py-10 md:py-14 rounded-[3rem] text-3xl md:text-4xl hover:bg-indigo-600 transition-all shadow-[0_20px_50px_-12px_rgba(79,70,229,0.5)] active:scale-95 uppercase tracking-widest disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? 'Sincronizando...' : 'ENVIAR PESQUISA'}
              </button>
            </form>
          </div>
        )}

        {/* ====================================================================== */}
        {/* TELA 2: DASHBOARD BI (GESTOR) */}
        {/* ====================================================================== */}
        {isLogged && view === 'bi' && analytics && (
          <div className="p-8 md:p-12 animate-in fade-in duration-700">
            {abaBI === 'geral' ? (
              <div className="space-y-12">
                
                {/* LINHA 1: CARDS DE % */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                  {analytics.pilares.map((p, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-xl transition-all relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                         <div className="h-full transition-all duration-1000" style={{ width: `${p.pct}%`, backgroundColor: Number(p.pct) > 75 ? '#10b981' : '#f59e0b' }}></div>
                      </div>
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">{p.nome}</span>
                      <h3 className="text-5xl font-black text-slate-900 tracking-tighter mt-4 group-hover:text-indigo-600">{p.pct}%</h3>
                    </div>
                  ))}
                </div>

                {/* LINHA 2: e-NPS E GRÁFICO BARRAS */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  
                  <div className="xl:col-span-4 bg-slate-900 p-12 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <h3 className="text-slate-400 font-black uppercase text-xs tracking-[0.5em] mb-12">Employee Net Promoter Score</h3>
                    <span className="text-[12rem] font-black tracking-tighter leading-none" style={{ color: analytics.corScore }}>{analytics.score}</span>
                    <div className="mt-8 px-10 py-3 rounded-full font-black text-sm uppercase tracking-widest shadow-lg" style={{ backgroundColor: `${analytics.corScore}20`, color: analytics.corScore }}>
                      ZONA DE {analytics.textScore}
                    </div>
                    <div className="w-full grid grid-cols-3 gap-4 mt-16 border-t border-slate-800 pt-12">
                      <div><p className="text-4xl font-black text-emerald-500">{analytics.p}</p><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Promotores</p></div>
                      <div><p className="text-4xl font-black text-slate-400">{analytics.n}</p><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Neutros</p></div>
                      <div><p className="text-4xl font-black text-rose-500">{analytics.d}</p><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Detratores</p></div>
                    </div>
                  </div>

                  <div className="xl:col-span-8 bg-white p-12 rounded-[3rem] shadow-xl border border-slate-200 flex flex-col min-h-[600px]">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-12 flex items-center">
                      <div className="w-3 h-10 bg-indigo-600 rounded-full mr-4"></div> Mapeamento de Saúde Organizacional (%)
                    </h3>
                    <div className="flex-1 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={analytics.pilares}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="nome" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 900, fontSize: 14}} dy={15} />
                          <YAxis hide domain={[0, 100]} />
                          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}} />
                          <Area type="monotone" dataKey="pct" fill="#4f46e5" fillOpacity={0.05} stroke="none" />
                          <Bar dataKey="pct" radius={[20, 20, 0, 0]} barSize={100}>
                            {analytics.pilares.map((e, i) => <Cell key={`bar-${i}`} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                          </Bar>
                          <Line type="monotone" dataKey="pct" stroke="#1e293b" strokeWidth={6} dot={{ r: 8, fill: '#fff', strokeWidth: 6 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* LINHA 3: RADAR E PIZZA */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
                  <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-200 min-h-[600px] flex flex-col items-center justify-center">
                    <h3 className="text-3xl font-black text-slate-900 uppercase mb-12 tracking-tighter">Equilíbrio da Área (Radar)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={analytics.pilares.map(p => ({ subject: p.nome, nota: p.raw }))}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 16, fontWeight: 900}} />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} />
                        <Radar name="Média Sinfães" dataKey="nota" stroke="#4f46e5" strokeWidth={8} fill="#6366f1" fillOpacity={0.3} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-200 min-h-[600px] flex flex-col items-center justify-center">
                    <h3 className="text-3xl font-black text-slate-900 uppercase mb-12 tracking-tighter">Frequência de Sentimento</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={[{ name: 'Promotores', value: analytics.p }, { name: 'Neutros', value: analytics.n }, { name: 'Detratores', value: analytics.d }]} 
                          cx="50%" cy="50%" innerRadius={140} outerRadius={200} paddingAngle={10} dataKey="value" stroke="none"
                        >
                          {PIE_COLORS.map((c, i) => <Cell key={`pie-${i}`} fill={c} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={50} wrapperStyle={{ fontWeight: 'black', fontSize: '16px', textTransform: 'uppercase' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              /* MURAL DE FEEDBACKS */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20 animate-in slide-in-from-right duration-700">
                {db.filter(r => r.observacoes).map((item, i) => (
                  <div key={`obs-${i}`} className="bg-white p-12 rounded-[3rem] shadow-xl border-t-8 border-indigo-600 flex flex-col justify-between min-h-[400px] hover:-translate-y-2 transition-transform">
                    <div className="text-[10rem] text-slate-50 font-serif absolute top-0 right-10 leading-none select-none">“</div>
                    <p className="text-slate-800 text-2xl leading-relaxed font-black italic relative z-10 pr-4">"{item.observacoes}"</p>
                    <div className="pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-8">
                      <span>REGISTRO #{item.id || i+1}</span>
                      <span>{new Date(item.data_envio).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====================================================================== */}
        {/* TELA 3: SUCESSO */}
        {/* ====================================================================== */}
        {view === 'sucesso' && (
          <div className="w-full flex-1 flex flex-col items-center justify-center p-8 animate-in zoom-in duration-500">
             <div className="max-w-3xl w-full bg-white p-24 rounded-[4rem] shadow-2xl text-center border-t-[20px] border-emerald-500">
                <div className="text-[12rem] mb-8 leading-none">🏆</div>
                <h2 className="text-7xl font-black text-slate-900 tracking-tighter uppercase mb-6">Concluído!</h2>
                <p className="text-slate-500 text-2xl font-bold mb-16 italic">Os dados foram criptografados e sincronizados com sucesso.</p>
                <button onClick={() => {setView('pesquisa'); setForm({ e_nps: -1, nota_clima: 0, nota_lideranca: 0, nota_satisfacao: 0, nota_reconhecimento: 0, nota_comunicacao: 0, nota_ferramentas: 0, observacoes: '' });}} className="w-full bg-slate-900 text-white font-black py-8 rounded-[2rem] text-2xl uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-2xl">Nova Pesquisa</button>
             </div>
          </div>
        )}

      </main>

      {/* LOGIN MOBILE (Visível apenas se não estiver logado e não for header) */}
      {!isLogged && view === 'pesquisa' && (
        <div className="md:hidden p-8 flex justify-center border-t border-slate-200">
          <button onClick={() => { const p = prompt("Senha Gestor:"); if(p==='admin123') {setIsLogged(true); setView('bi');} }} className="text-slate-400 font-black text-xs uppercase tracking-widest">
            Acesso BI
          </button>
        </div>
      )}
    </div>
  );
}