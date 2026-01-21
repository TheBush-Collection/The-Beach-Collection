import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Globe, Award, Heart, Camera, Compass, Shield, MapPin, Phone, Mail, Sparkles, Target, Rocket, Trophy, Waves, Building2, Bed } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

// Timeline milestone data
const timelineData = [
  {
    year: '2023',
    title: 'The Dream Begins',
    icon: Sparkles,
    description: 'Founded with a vision to redefine coastal hospitality in Kenya, The Beach Collection started with our first stunning beachfront property, offering guests an unparalleled retreat experience.',
    highlights: ['First beachfront property opened', 'Partnership with local artisans', 'Sustainable hospitality commitment'],
    image: '/images/PNG-LOGO (1).png',
    color: 'from-[#749DD0] to-[#92AAD1]'
  },
  {
    year: '2024',
    title: 'Growing Together',
    icon: Target,
    description: 'Word spread quickly about our exceptional hospitality. We expanded our portfolio, welcomed guests from across the globe, and built a team dedicated to creating memorable stays.',
    highlights: ['500+ satisfied guests', 'Team expanded to 7 members', 'New coastal properties added'],
    image: '/images/PNG-LOGO (1).png',
    color: 'from-[#92AAD1] to-[#CFE7F8]'
  },
  {
    year: '2025',
    title: 'Setting New Standards',
    icon: Rocket,
    description: 'This year marks our commitment to luxury excellence with premium amenities, enhanced guest services, and our innovative digital booking platform for seamless reservations.',
    highlights: ['Premium amenities upgrade', 'Digital booking platform launched', '1000+ guests milestone'],
    image: '/images/PNG-LOGO (1).png',
    color: 'from-[#48547C] to-[#749DD0]'
  },
  {
    year: '2026',
    title: 'The Future',
    icon: Trophy,
    description: 'Looking ahead, we\'re expanding our collection with new boutique properties, sustainable initiatives, and exclusive experiences that showcase the best of Kenya\'s coast.',
    highlights: ['New boutique hotels', 'Eco-friendly initiatives', 'Exclusive guest experiences'],
    image: '/images/PNG-LOGO (1).png',
    color: 'from-[#33343B] to-[#48547C]'
  }
];

// Interactive Timeline Component
function InteractiveTimeline() {
  const [activeYear, setActiveYear] = useState('2023');
  const activeItem = timelineData.find(item => item.year === activeYear) || timelineData[0];
  const ActiveIcon = activeItem.icon;

  return (
    <div className="relative">
      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-8">
        {/* Vertical Timeline Navigation */}
        <div className="col-span-2 relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#749DD0] via-[#92AAD1] to-[#CFE7F8] -translate-x-1/2" />
          
          {/* Year Nodes */}
          <div className="relative flex flex-col justify-between h-[500px] py-4">
            {timelineData.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeYear === item.year;
              
              return (
                <button
                  key={item.year}
                  onClick={() => setActiveYear(item.year)}
                  className={`
                    group relative flex items-center justify-center transition-all duration-500
                    ${isActive ? 'scale-110' : 'hover:scale-105'}
                  `}
                >
                  {/* Connector Line Glow */}
                  {isActive && (
                    <div className="absolute left-1/2 w-20 h-0.5 bg-gradient-to-r from-[#749DD0] to-transparent translate-x-4" />
                  )}
                  
                  {/* Year Circle */}
                  <div className={`
                    relative w-16 h-16 rounded-full flex items-center justify-center
                    transition-all duration-500 cursor-pointer
                    ${isActive 
                      ? `bg-gradient-to-br ${item.color} shadow-lg shadow-[#749DD0]/30` 
                      : 'bg-white border-2 border-[#CFE7F8] hover:border-[#749DD0]'
                    }
                  `}>
                    {isActive ? (
                      <Icon className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-sm font-bold text-[#48547C] group-hover:text-[#749DD0] transition-colors">
                        {item.year.slice(-2)}
                      </span>
                    )}
                    
                    {/* Pulse Ring for Active */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-[#749DD0]/20 animate-ping" />
                    )}
                  </div>
                  
                  {/* Year Label */}
                  <div className={`
                    absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap
                    font-bold transition-all duration-300
                    ${isActive ? 'text-[#749DD0] text-lg' : 'text-[#48547C]/60 text-sm'}
                  `}>
                    {item.year}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="col-span-10">
          <div 
            key={activeYear}
            className="bg-white/80 backdrop-blur-sm rounded-3xl border border-[#CFE7F8] shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500"
          >
            <div className="grid md:grid-cols-2">
              {/* Text Content */}
              <div className="p-8 lg:p-10">
                {/* Year Badge */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activeItem.color} flex items-center justify-center`}>
                    <ActiveIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <Badge className="bg-[#92AAD1]/20 text-[#48547C] border-0 text-lg px-3 py-1">
                      {activeItem.year}
                    </Badge>
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-3xl font-bold text-[#33343B] mb-4">
                  {activeItem.title}
                </h3>
                
                {/* Description */}
                <p className="text-[#48547C]/80 text-lg leading-relaxed mb-6">
                  {activeItem.description}
                </p>
                
                {/* Highlights */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-[#48547C] uppercase tracking-wider">
                    Key Milestones
                  </h4>
                  <ul className="space-y-2">
                    {activeItem.highlights.map((highlight, i) => (
                      <li 
                        key={i}
                        className="flex items-center gap-3 text-[#48547C]"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${activeItem.color}`} />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Image Side */}
              <div className={`relative bg-gradient-to-br ${activeItem.color} p-8 flex items-center justify-center min-h-[400px]`}>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '30px 30px'
                  }} />
                </div>
                <img 
                  src={activeItem.image}
                  alt={activeItem.title}
                  className="relative w-48 h-48 object-contain drop-shadow-2xl"
                />
                {/* Floating Year */}
                <div className="absolute bottom-6 right-6 text-8xl font-black text-white/10">
                  {activeItem.year}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Horizontal Timeline Navigation */}
        <div className="relative mb-8">
          {/* Horizontal Line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-[#749DD0] via-[#92AAD1] to-[#CFE7F8]" />
          
          {/* Year Buttons */}
          <div className="flex justify-between relative z-10">
            {timelineData.map((item) => {
              const Icon = item.icon;
              const isActive = activeYear === item.year;
              
              return (
                <button
                  key={item.year}
                  onClick={() => setActiveYear(item.year)}
                  className="flex flex-col items-center"
                >
                  <div className={`
                    w-14 h-14 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${isActive 
                      ? `bg-gradient-to-br ${item.color} shadow-lg` 
                      : 'bg-white border-2 border-[#CFE7F8]'
                    }
                  `}>
                    {isActive ? (
                      <Icon className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-xs font-bold text-[#48547C]">{item.year.slice(-2)}</span>
                    )}
                  </div>
                  <span className={`
                    mt-3 text-sm font-semibold transition-colors
                    ${isActive ? 'text-[#749DD0]' : 'text-[#48547C]/50'}
                  `}>
                    {item.year}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Card */}
        <div 
          key={activeYear}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#CFE7F8] shadow-lg overflow-hidden"
        >
          {/* Image Header */}
          <div className={`relative bg-gradient-to-br ${activeItem.color} p-6 flex items-center justify-center`}>
            <img 
              src={activeItem.image}
              alt={activeItem.title}
              className="w-24 h-24 object-contain drop-shadow-xl"
            />
            <div className="absolute top-3 right-3 text-4xl font-black text-white/20">
              {activeItem.year}
            </div>
          </div>
          
          {/* Text Content */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${activeItem.color} flex items-center justify-center`}>
                <ActiveIcon className="w-5 h-5 text-white" />
              </div>
              <Badge className="bg-[#92AAD1]/20 text-[#48547C] border-0">
                {activeItem.year}
              </Badge>
            </div>
            
            <h3 className="text-2xl font-bold text-[#33343B] mb-3">
              {activeItem.title}
            </h3>
            
            <p className="text-[#48547C]/80 leading-relaxed mb-5">
              {activeItem.description}
            </p>
            
            <div className="space-y-2">
              {activeItem.highlights.map((highlight, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[#48547C]">
                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${activeItem.color}`} />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const stats = [
    { icon: Users, label: 'Happy Guests', value: '1,000+' },
    { icon: Building2, label: 'Properties', value: '5+' },
    { icon: Award, label: 'Years Experience', value: '2+' },
    { icon: Star, label: 'Average Rating', value: '4.9' }
  ];

  const team = [
    {
      name: 'Andre Du Plessis',
      role: 'Founder & CEO',
      image: '',
      bio: 'Hospitality visionary with 20+ years of experience in luxury coastal properties'
    },
    {
      name: 'James Mwangi',
      role: 'Head of IT',
      image: 'https://westus31-mediap.svc.ms/transform/thumbnail?provider=spo&farmid=194147&inputFormat=jpeg&cs=fFNQTw&docid=https%3A%2F%2Fmy.microsoftpersonalcontent.com%2F_api%2Fv2.0%2Fdrives%2Fb!UHvAJHRZv0uHtY6cWKy5LhPq4UG_8gRHvcdyi-WzL1rWc8fM8bbUQaApuV5hXGy_%2Fitems%2F01GBRSVX6E3BPKML4XKBCKVKAYJSIMVK2V%3Ftempauth%3Dv1e.eyJzaXRlaWQiOiIyNGMwN2I1MC01OTc0LTRiYmYtODdiNS04ZTljNThhY2I5MmUiLCJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvbXkubWljcm9zb2Z0cGVyc29uYWxjb250ZW50LmNvbUA5MTg4MDQwZC02YzY3LTRjNWItYjExMi0zNmEzMDRiNjZkYWQiLCJleHAiOiIxNzY4MzA1NjAwIn0.B_dTR2Xl9MsMGk4SjyraLmtng55917bKu43amr2QBN-iPGxox4vUHi1xkfxgy85cPl58bRkj-xuG3P8g2tp97RHD6vhhJbDbQ2dRt9_AwujqMIhaFd3PGvG0mXaZCO8GCsiJ_qyznHaZXpVS95vltH7o7WCnObH0dw3XpxgEeoa49GCQhZ9THVlA8z2ybrG-5iYHZ07yRtJlQ2_ZtRfymNpGXmyO2BCrnHxXU8m2Qs5a99x3uSDnp3ZCxEFBfHW-igBMmREZzQ4frDlSm5y3FRm5iGXaBpnaUmBUqcFUXPK9O8MELq5041qhJfEFbp0HSSLijp84WbDh5hBzM_rAU8ynhahWk0sMvj1lkLmN2ge-3KHCSVHf81T4t8e_xg2q88dL-NEKD60Fcjb7dEqucG3hYxBIB2e1pfSqf-Wjen51qtk0U0A9_r-Q1DXnga44678QP97LIVAH7b1ttmqi__iu3jzUN2-gDxT_dNeYPA5ANU7O-fGopQXc3Gyus-7W.hLrn1URfkgQOLej6T7p-qrgKQCHVOHmX2n-P48patkA%26version%3DPublished&cb=63903813516&encodeFailures=1&width=503&height=755',
      bio: 'Expert in hospitality technology and digital guest experiences'
    },
    {
      name: 'Linda Ogutu',
      role: 'Head of Reservations & Sales',
      image: 'https://westus31-mediap.svc.ms/transform/thumbnail?provider=spo&farmid=194147&inputFormat=jpeg&cs=fFNQTw&docid=https%3A%2F%2Fmy.microsoftpersonalcontent.com%2F_api%2Fv2.0%2Fdrives%2Fb!UHvAJHRZv0uHtY6cWKy5LhPq4UG_8gRHvcdyi-WzL1rWc8fM8bbUQaApuV5hXGy_%2Fitems%2F01GBRSVX5VQCDHUL3LOFCJSAFQ5ZIOJ2FZ%3Ftempauth%3Dv1e.eyJzaXRlaWQiOiIyNGMwN2I1MC01OTc0LTRiYmYtODdiNS04ZTljNThhY2I5MmUiLCJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvbXkubWljcm9zb2Z0cGVyc29uYWxjb250ZW50LmNvbUA5MTg4MDQwZC02YzY3LTRjNWItYjExMi0zNmEzMDRiNjZkYWQiLCJleHAiOiIxNzY4MzA1NjAwIn0.zXNHsNj2FrsrdG3SkQGgvdTTJ9_Wunya-3x1Of9yU-wG8SL1xVwXIwPDZ9-MHoSFRx-zF1HMtTFpu68dmOY-88MyHuehehdJ28T9_20qS90X5Rb0LGg___KoDIfAGtMlIMOpSkuZcGKTA1edFYfkCHfEl0MzXmNJr8-qWl3Zo7OPW9QwWlG3mIuyBNjZXMgwtYIDXzXb41iEKNV1cntufWqxCx9rPTfBUg2vf-52xXlGLuJPmjYNrdlukEEFXpVbIg4a_sJe6LtrVLwU9qbrMgVsLwuQ3EcnbzR-IyNrugHTeWW3WqoR0Cog8EhT9nL4snm8NAZgQn8NxlpMYQDVJ1lWtX8mjGqgXvyVeWeHYy42GfgK3hdJp_duZvTmJGz9NEm0y0S4xbtzCz6JgLIUrL--OkGKN4mNX1ZLBG2aSMtthccYI46j_P4y9N0zCc3qVhnQ0lNHPQyasKeCch8Fgv_bgwk6Nic8g9MrrVJaFk0CQNFpOxMmua7mCxXfElKu.3J5D6cWsIQ-jdvx-lo5_1_rKeev9tnljuejVVz6Qe4c%26version%3DPublished&cb=63903809112&encodeFailures=1&width=503&height=755',
      bio: 'A passionate hotelier dedicated to creating memorable guest experiences while driving sales growth and operational excellence.'
    },
    {
      name: 'Paul',
      role: 'General Manager',
      image: '',
      bio: 'Born in Kenya, passionate about sharing African culture'
    },
    {
      name: 'Molly Obondi',
      role: 'Sales and reservations',
      image: 'https://westus31-mediap.svc.ms/transform/thumbnail?provider=spo&farmid=194147&inputFormat=jpeg&cs=fFNQTw&docid=https%3A%2F%2Fmy.microsoftpersonalcontent.com%2F_api%2Fv2.0%2Fdrives%2Fb!UHvAJHRZv0uHtY6cWKy5LhPq4UG_8gRHvcdyi-WzL1rWc8fM8bbUQaApuV5hXGy_%2Fitems%2F01GBRSVX2NLUTGCVORNVAYVNOYXFEM5ZEY%3Ftempauth%3Dv1e.eyJzaXRlaWQiOiIyNGMwN2I1MC01OTc0LTRiYmYtODdiNS04ZTljNThhY2I5MmUiLCJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvbXkubWljcm9zb2Z0cGVyc29uYWxjb250ZW50LmNvbUA5MTg4MDQwZC02YzY3LTRjNWItYjExMi0zNmEzMDRiNjZkYWQiLCJleHAiOiIxNzY4MzA1NjAwIn0.0kdb0J2rJWUe2v0BWJTOFtoG8Jg3mmixxsEGyUpwryubqTiMNTqfBwf3GziWEHa2jJPPdLWe2Ool-ksO_428mvPAzeA6DRBE74AZ8dgLIAw5m5JI22jX6E07DmiAblDKRMHyWO-9869_GA5G5zGiZDyfAbqM9pc0Nq31tv74WRWwjfcdRZFLJqqK5R-8dUJKH9qymHxcuCpfq-OQPQaGYdgzkcg7ZNVbztmySmoFHRa9OTnAzat5ROdpnaDepXDLNqk94xbX2q2-1nfFo7RBDqKxOhArgO_yltVFzhiEwFU99bAv_jHHsWYqScKWhRXSXl6UY84ssGmvz_s0GgqZmB683vYc3aMW65P8Ya80bdUJ1KywPCp_VVXCViT3yVTBjKCVmtgMQj9BI0kOKaRyMWdN-CQ_6EMaIKb1_yH7Loh1jZw7dUtzcR10ryRiPoIDtvbfKSs-5goDUK1ig1Gr3P8bPJsXgLCofUNc_QA6fhyvGoQ6H_awSxf3j-Zj2LJy.b6cCga4D8IPI-XTGFrlj01IIprapiqmeGo6Ixb6g9jE%26version%3DPublished&cb=63903809112&encodeFailures=1&width=503&height=755',
      bio: 'With a genuine love for hospitality, takes pride in connecting guests with the perfect stay experience.'
    },
    {
      name: 'Christine',
      role: 'Procurement Officer',
      image: 'https://westus31-mediap.svc.ms/transform/thumbnail?provider=spo&farmid=194147&inputFormat=jpeg&cs=fFNQTw&docid=https%3A%2F%2Fmy.microsoftpersonalcontent.com%2F_api%2Fv2.0%2Fdrives%2Fb!UHvAJHRZv0uHtY6cWKy5LhPq4UG_8gRHvcdyi-WzL1rWc8fM8bbUQaApuV5hXGy_%2Fitems%2F01GBRSVX7BMEAP7OOQGJB2K6SUJIWIBVHV%3Ftempauth%3Dv1e.eyJzaXRlaWQiOiIyNGMwN2I1MC01OTc0LTRiYmYtODdiNS04ZTljNThhY2I5MmUiLCJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvbXkubWljcm9zb2Z0cGVyc29uYWxjb250ZW50LmNvbUA5MTg4MDQwZC02YzY3LTRjNWItYjExMi0zNmEzMDRiNjZkYWQiLCJleHAiOiIxNzY4MzA1NjAwIn0.E2zDvGWCGB_qeOlNwsuR0gvqniJWE7GrCCXxfVqN6l7IB1yXFdJpqTqFF-Y6i_PVFKH9oofCJSPFRuJEWmwF_OfUZkhuYgmpqZN_fOp9tnMcfs_32en0FQwr8ASzzCnXdZ_q3icZGavClLO4f07nqvXHNK6MTwJwZpBV7TZy_fAobmcjWZqDjfcJ8SPhyL0bGGh2PhkNqxrHYqGToRmYy8JLVn9EdyvAE7dFFUfNULu8SIOkWSidUQirwRG_CXgD6OYM2sAK5aQrcbJ2rxpJCXLKnUHD___oOtNxMxtW56n_e2YAyrR0M_ShNip-MxOTjsHtgIRamweWB-g-F1B6S_wKM9SRcDCOuXPdeLZKR8jEhNzRW13ddH5092IK5DgjwGIny3kC-8Fo0ZYIjBHZHSUFNGgx7oVg6KJHvLwMg_0wgu_nRAcdiFGcn6-z_JWsLWLuF86v2e48FLHfUHFi0Y9a7i2JU4K8FCKyH8p9PLLsVSzjSEIE5UO9nO2qNUDu.kCt977tEq3aP4HsVzdFlF-fzokM0AVqfMqm7T-O_qpI%26version%3DPublished&cb=63903809112&encodeFailures=1&width=503&height=755',
      bio: 'Born in Kenya, passionate about sharing African culture'
    },
    {
      name: 'Timsheldon',
      role: 'IT Support Officer',
      image: 'https://westus31-mediap.svc.ms/transform/thumbnail?provider=spo&farmid=194147&inputFormat=jpeg&cs=fFNQTw&docid=https%3A%2F%2Fmy.microsoftpersonalcontent.com%2F_api%2Fv2.0%2Fdrives%2Fb!UHvAJHRZv0uHtY6cWKy5LhPq4UG_8gRHvcdyi-WzL1rWc8fM8bbUQaApuV5hXGy_%2Fitems%2F01GBRSVX3D7YAWS4K76ND25RTQL7X642OJ%3Ftempauth%3Dv1e.eyJzaXRlaWQiOiIyNGMwN2I1MC01OTc0LTRiYmYtODdiNS04ZTljNThhY2I5MmUiLCJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvbXkubWljcm9zb2Z0cGVyc29uYWxjb250ZW50LmNvbUA5MTg4MDQwZC02YzY3LTRjNWItYjExMi0zNmEzMDRiNjZkYWQiLCJleHAiOiIxNzY4MzA1NjAwIn0.lF9j-wzYG6_hhVB0jwS0LQXa5eJEE1SErr8d1-oCdwjkOXLyc9UgtU4V8UoaftR6IbTIG0NAubliY6iHrSiqQlsFN_TzGZHMPNWBoNCourknpKySI-byNsoO67qmG7QX_bGG2YVgZC2T1XpO3DYzLq2FsRpGyxoPOinWEI-LGWN4N86OS6EpNOM2v0i6o91mG1cyOPnVHqqhWODTu9JRgLVYZHucvblSk5IS5wwmLFinKqT0vvbswXtlRehe5aGM20YwzGM_eH1NegtPMeTaXAIHbB9lmRcWPyHRwqK4OEURdhFritV3zF6f8K72gq0XTNnBD4_zrBsgyFtrVchw4hDKR1t3GryZ6fcPd_RaAPYmt34wtwYXuqKCo84wWJkdALaw4-FidoZD1lEnIzDZmu4AXponr952W-AXJmgrxr5G5dc1vWwo3lIH4o835uYO28bZ71CnaeboYCy_I2B3c2yV2zO-cEIhHfjTAJRTj7TYlZ_S2p3hA92oR54av_mP.kUmm9t2j-2pSTOyEAVheHWYhESz0GHvz_WZew44OWHE%26version%3DPublished&cb=63903809112&encodeFailures=1&width=503&height=755',
      bio: 'Born in Kenya, passionate about sharing African culture'
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Guest First',
      description: 'Every detail is crafted with our guests in mind, ensuring personalized service and unforgettable stays at every property.'
    },
    {
      icon: Users,
      title: 'Community Impact',
      description: 'We employ local talent and support coastal communities through sustainable tourism and economic development.'
    },
    {
      icon: Waves,
      title: 'Authentic Experiences',
      description: 'We create genuine coastal retreats that connect you with Kenya\'s stunning beaches and rich local culture.'
    },
    {
      icon: Shield,
      title: 'Quality & Comfort',
      description: 'Your comfort is our priority. We maintain the highest standards in amenities, cleanliness, and service excellence.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Modern Immersive Design */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            className="w-full h-full object-cover scale-105"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/images/16.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#33343B]/80 via-[#33343B]/60 to-[#33343B]/90" />
          {/* Decorative gradient accents */}
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[#33343B] to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#33343B] to-transparent" />
        </div>

        {/* Animated Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top Left Blur */}
          <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-[#749DD0]/20 rounded-full blur-[100px] animate-pulse" />
          {/* Bottom Right Blur */}
          <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-[#92AAD1]/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          {/* Center accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#CFE7F8]/5 rounded-full blur-[150px]" />
          
          {/* Floating Geometric Shapes */}
          <div className="absolute top-20 left-[10%] w-20 h-20 border border-[#92AAD1]/30 rounded-2xl rotate-12 animate-bounce" style={{ animationDuration: '4s' }} />
          <div className="absolute top-32 right-[15%] w-16 h-16 border border-[#749DD0]/20 rounded-full animate-bounce" style={{ animationDuration: '5s', animationDelay: '0.5s' }} />
          <div className="absolute bottom-40 left-[20%] w-12 h-12 bg-[#92AAD1]/10 rounded-lg rotate-45 animate-bounce" style={{ animationDuration: '6s', animationDelay: '1s' }} />
          <div className="absolute bottom-32 right-[25%] w-24 h-24 border-2 border-[#CFE7F8]/20 rounded-full animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '0.3s' }} />
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8">
                  <Waves className="w-4 h-4 text-[#92AAD1]" />
                  <span className="text-[#CFE7F8] font-medium tracking-wider uppercase text-sm">Est. 2023 · Kenya Coast</span>
                </div>

                {/* Main Title */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]">
                  Luxury Stays on
                  <span className="block mt-2 bg-gradient-to-r from-[#92AAD1] via-[#CFE7F8] to-[#92AAD1] bg-clip-text text-transparent">
                    Kenya's Coast
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                  For over 2 years, we've been curating exceptional beachfront experiences. 
                  Our passion for hospitality and Kenya's stunning coastline drives everything we do.
                </p>

                {/* Stats Row */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-10">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-white">1,000+</div>
                    <div className="text-[#92AAD1] text-sm font-medium">Happy Guests</div>
                  </div>
                  <div className="w-px h-12 bg-white/20 hidden sm:block" />
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-white">5+</div>
                    <div className="text-[#92AAD1] text-sm font-medium">Properties</div>
                  </div>
                  <div className="w-px h-12 bg-white/20 hidden sm:block" />
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-white">4.9</div>
                    <div className="text-[#92AAD1] text-sm font-medium">Rating</div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/collections">
                    <Button size="lg" className="group bg-gradient-to-r from-[#749DD0] to-[#92AAD1] hover:from-[#92AAD1] hover:to-[#749DD0] text-white px-8 py-6 rounded-full text-lg font-semibold shadow-lg shadow-[#749DD0]/25 hover:shadow-xl hover:shadow-[#749DD0]/30 transition-all duration-500 hover:-translate-y-1">
                      View Properties
                      <Building2 className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-6 rounded-full text-lg font-semibold backdrop-blur-sm transition-all duration-300">
                      Get in Touch
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Side - Feature Cards */}
              <div className="hidden lg:block relative">
                <div className="relative">
                  {/* Main Feature Card */}
                  <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                    <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-[#749DD0] to-[#92AAD1] rounded-2xl flex items-center justify-center shadow-lg">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Our Mission</h3>
                    <p className="text-white/70 leading-relaxed mb-6">
                      To provide unforgettable coastal escapes that blend luxury accommodation 
                      with authentic Kenyan hospitality, creating memories that last a lifetime.
                    </p>
                    
                  </div>

                  {/* Floating Mini Cards */}
                  <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#749DD0] to-[#92AAD1] rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Premium Stay</div>
                        <div className="text-white/50 text-sm">Verified properties</div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -top-4 -left-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#92AAD1] to-[#CFE7F8] rounded-xl flex items-center justify-center">
                        <Star className="w-6 h-6 text-white fill-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Top Rated</div>
                        <div className="text-white/50 text-sm">5-star reviews</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span className="text-white/50 text-sm font-medium">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white relative -mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, label, value }, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-3xl bg-gradient-to-br from-[#CFE7F8]/50 to-white border border-[#92AAD1]/20 hover:border-[#749DD0]/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#749DD0] to-[#92AAD1] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <div className="text-4xl font-bold text-[#33343B] mb-1">{value}</div>
                <div className="text-[#48547C]/70">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section - Interactive Timeline */}
      <section className="py-24 bg-gradient-to-b from-white via-[#CFE7F8]/20 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#92AAD1]/20 text-[#48547C] rounded-full text-sm font-medium mb-6">
              <Compass className="w-4 h-4" />
              Our Journey
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#33343B] mb-4">
              Our Story
            </h2>
            <p className="text-xl text-[#48547C]/70 max-w-2xl mx-auto">
              From a dream to Africa's trusted safari experience — explore our journey through the years
            </p>
          </div>

          <InteractiveTimeline />
        </div>
      </section>

      {/* Values Section - Modern Bento Grid */}
      <section className="py-24 bg-gradient-to-b from-white via-[#CFE7F8]/20 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#92AAD1]/20 text-[#48547C] rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              What We Believe
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#33343B] mb-4">
              Our Values
            </h2>
            <p className="text-xl text-[#48547C]/70 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Large Featured Card - Guest First */}
            <div className="md:col-span-2 lg:row-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#749DD0] to-[#48547C] p-8 lg:p-10 min-h-[320px] lg:min-h-[400px] flex flex-col justify-between">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '24px 24px'
                }} />
              </div>
              {/* Floating Shapes */}
              <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute bottom-10 left-10 w-24 h-24 bg-[#CFE7F8]/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">Guest First</h3>
                <p className="text-white/80 text-lg leading-relaxed max-w-md">
                  Every detail is crafted with our guests in mind, ensuring personalized service and unforgettable stays at every property.
                </p>
              </div>
              
              <div className="relative z-10 flex items-center gap-3 mt-6">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white/30 border-2 border-white/50" />
                  <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/50" />
                  <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/50" />
                </div>
                <span className="text-white/70 text-sm">1,000+ happy guests</span>
              </div>
            </div>

            {/* Community Impact Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-white border border-[#CFE7F8] p-6 lg:p-8 hover:shadow-2xl hover:border-[#92AAD1]/50 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#92AAD1]/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-[#92AAD1] to-[#CFE7F8] rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-lg shadow-[#92AAD1]/20">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#33343B] mb-2">Community Impact</h3>
                <p className="text-[#48547C]/70 text-sm leading-relaxed">
                  We employ local talent and support coastal communities through sustainable tourism.
                </p>
              </div>
            </div>

            {/* Authentic Experiences Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-white border border-[#CFE7F8] p-6 lg:p-8 hover:shadow-2xl hover:border-[#92AAD1]/50 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-[#749DD0]/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-[#749DD0] to-[#92AAD1] rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-[#749DD0]/20">
                  <Waves className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#33343B] mb-2">Authentic Experiences</h3>
                <p className="text-[#48547C]/70 text-sm leading-relaxed">
                  Genuine coastal retreats connecting you with Kenya's stunning beaches.
                </p>
              </div>
            </div>

            {/* Quality & Comfort - Wide Card */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#33343B] to-[#48547C] p-6 lg:p-8 hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(45deg, white 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#749DD0]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">Quality & Comfort</h3>
                  <p className="text-white/70 leading-relaxed">
                    Your comfort is our priority. We maintain the highest standards in amenities, cleanliness, and service excellence across all our properties.
                  </p>
                </div>
                <div className="hidden lg:flex items-center gap-2">
                  <div className="flex flex-col items-center px-4 py-2 bg-white/10 rounded-xl">
                    <span className="text-2xl font-bold text-white">5+</span>
                    <span className="text-xs text-white/60">Properties</span>
                  </div>
                  <div className="flex flex-col items-center px-4 py-2 bg-white/10 rounded-xl">
                    <span className="text-2xl font-bold text-white">4.9</span>
                    <span className="text-xs text-white/60">Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#92AAD1]/20 text-[#48547C] rounded-full text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              The People Behind
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#33343B] mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-[#48547C]/70">
              Passionate professionals dedicated to creating your perfect safari experience
            </p>
          </div>

          {/* Founder - Featured */}
          <div className="flex justify-center mb-12">
            <div className="group relative rounded-3xl overflow-hidden max-w-sm w-full h-[450px] shadow-xl cursor-pointer">
              {/* Full Image */}
              <img
                src={team[0].image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'}
                alt={team[0].name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Gradient Overlay - Always visible at bottom, full on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#33343B] via-[#33343B]/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#33343B]/90 to-transparent" />
              
              {/* Founder Badge */}
              <div className="absolute top-4 left-4 z-20">
                <Badge className="bg-[#749DD0] text-white border-0 px-3 py-1">Founder & CEO</Badge>
              </div>
              
              {/* Content - Slides up on hover */}
              <div className="absolute inset-x-0 bottom-0 p-6 transform translate-y-[calc(100%-80px)] group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-2xl font-bold text-white mb-1">{team[0].name}</h3>
                <p className="text-[#92AAD1] font-medium mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{team[0].role}</p>
                <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200 line-clamp-3">{team[0].bio}</p>
              </div>
            </div>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.slice(1).map((member, index) => (
              <div 
                key={index} 
                className="group relative rounded-2xl overflow-hidden h-[320px] shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1"
              >
                {/* Full Image */}
                <img
                  src={member.image || `https://images.unsplash.com/photo-150700321116${index}-0a1dd7228f2d?w=300&h=400&fit=crop`}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#33343B] via-[#33343B]/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#33343B]/80 to-transparent" />
                
                {/* Content - Slides up on hover */}
                <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-[calc(100%-50px)] group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-base font-bold text-white mb-0.5 truncate">{member.name}</h3>
                  <p className="text-[#92AAD1] font-medium text-xs mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{member.role}</p>
                  <p className="text-white/80 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200 line-clamp-3">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conservation Section */}
      <section className="py-20 bg-gradient-to-br from-[#749DD0] to-[#48547C] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 text-white rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                <Heart className="w-4 h-4" />
                Making a Difference
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Conservation Partnership
              </h2>
              <div className="space-y-5 text-white/80 text-lg">
                <p>
                  We believe that tourism should benefit wildlife and local communities. That's why we partner with conservation organizations and donate 5% of our profits to wildlife protection initiatives.
                </p>
                <p>
                  Our tours are designed to minimize environmental impact while maximizing positive contributions to conservation efforts and local economies.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                <Badge className="bg-white text-[#48547C] border-0 px-4 py-2">Carbon Neutral Tours</Badge>
                <Badge className="bg-white text-[#48547C] border-0 px-4 py-2">Local Community Support</Badge>
                <Badge className="bg-white text-[#48547C] border-0 px-4 py-2">Wildlife Protection</Badge>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop"
                alt="Wildlife conservation"
                className="relative rounded-3xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-[#CFE7F8]/30 to-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#92AAD1]/20 text-[#48547C] rounded-full text-sm font-medium mb-6">
            🦁 Start Your Journey
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#33343B] mb-6">
            Ready for Your African Adventure?
          </h2>
          <p className="text-xl text-[#48547C]/70 mb-10 max-w-2xl mx-auto">
            Join thousands of travelers who have experienced the magic of Africa with us
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/packages">
              <Button size="lg" className="bg-gradient-to-r from-[#749DD0] to-[#92AAD1] hover:from-[#48547C] hover:to-[#749DD0] text-white px-10 py-6 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                View Safari Packages
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-2 border-[#749DD0] text-[#48547C] hover:bg-[#749DD0] hover:text-white px-10 py-6 rounded-full text-lg font-semibold transition-all duration-300">
                Plan Custom Safari
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#33343B] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#92AAD1] to-[#CFE7F8] bg-clip-text text-transparent">Safari Tours</h3>
              <p className="text-white/60 mb-6 leading-relaxed">
                Creating unforgettable safari experiences across Africa's most spectacular destinations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-5 text-white text-lg">Quick Links</h4>
              <ul className="space-y-3 text-white/60">
                <li><Link to="/packages" className="hover:text-[#92AAD1] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#92AAD1]/50"></span>Safari Packages</Link></li>
                <li><Link to="/collections" className="hover:text-[#92AAD1] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#92AAD1]/50"></span>Properties</Link></li>
                <li><Link to="/about" className="hover:text-[#92AAD1] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#92AAD1]/50"></span>About Us</Link></li>
                <li><Link to="/contact" className="hover:text-[#92AAD1] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#92AAD1]/50"></span>Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-5 text-white text-lg">Destinations</h4>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#92AAD1]/50"></span>Tanzania</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#92AAD1]/50"></span>Kenya</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-5 text-white text-lg">Contact</h4>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#48547C] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#92AAD1]" />
                  </div>
                  +254 116072343
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#48547C] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-[#92AAD1]" />
                  </div>
                  info@thebushcollection.africa
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#48547C] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-[#92AAD1]" />
                  </div>
                  <span>42 Claret Close, Silanga Road, Karen.<br/>P.O BOX 58671-00200, Nairobi</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#48547C] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-white/50">
            <p>&copy; 2024 The Bush Collection. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
              <a href="#" className="hover:text-[#92AAD1] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#92AAD1] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}