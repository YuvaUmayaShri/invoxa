import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const LoadingSkeleton = ({ type = 'table', rows = 5, className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const shimmer = isDark ? '#352924' : '#F0E8E0';
  const bg      = isDark ? '#29211E' : '#FFFCF8';
  const border  = isDark ? '#54423A' : '#E8DED5';

  const skeletonStyle = {
    background: `linear-gradient(90deg, ${shimmer} 25%, ${isDark ? '#3D2F29' : '#FFF0E8'} 50%, ${shimmer} 75%)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite linear',
    borderRadius: '6px',
  };

  if (type === 'cards') {
    return (
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:'16px' }}
        className={className}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ borderRadius:'14px', border:`1px solid ${border}`, background: bg, padding:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
              <div style={{ ...skeletonStyle, height:'12px', width:'80px' }}/>
              <div style={{ ...skeletonStyle, height:'32px', width:'32px', borderRadius:'10px' }}/>
            </div>
            <div style={{ ...skeletonStyle, height:'28px', width:'110px', marginBottom:'10px' }}/>
            <div style={{ ...skeletonStyle, height:'11px', width:'70px' }}/>
          </div>
        ))}
        <style>{`@keyframes shimmer{from{background-position:-200% 0}to{background-position:200% 0}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ width:'100%', borderRadius:'14px', border:`1px solid ${border}`, background: bg, overflow:'hidden' }}
      className={className}>
      <div style={{ padding:'16px', borderBottom:`1px solid ${border}`, display:'flex', gap:'16px' }}>
        {[100,140,110,80].map((w, i) => (
          <div key={i} style={{ ...skeletonStyle, height:'14px', width:`${w}px` }}/>
        ))}
      </div>
      <div>
        {[...Array(rows)].map((_, i) => (
          <div key={i} style={{ padding:'16px', borderBottom:`1px solid ${isDark?'rgba(53,64,51,0.5)':'rgba(232,222,213,0.7)'}`,
            display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', flex:1 }}>
              <div style={{ ...skeletonStyle, width:'36px', height:'36px', borderRadius:'10px', flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div style={{ ...skeletonStyle, height:'13px', width:'60%', marginBottom:'6px' }}/>
                <div style={{ ...skeletonStyle, height:'10px', width:'40%' }}/>
              </div>
            </div>
            <div style={{ ...skeletonStyle, height:'13px', width:'80px' }}/>
            <div style={{ ...skeletonStyle, height:'13px', width:'70px' }}/>
            <div style={{ ...skeletonStyle, height:'24px', width:'70px', borderRadius:'12px' }}/>
            <div style={{ ...skeletonStyle, height:'32px', width:'60px', borderRadius:'8px' }}/>
          </div>
        ))}
      </div>
      <style>{`@keyframes shimmer{from{background-position:-200% 0}to{background-position:200% 0}}`}</style>
    </div>
  );
};

export default LoadingSkeleton;
