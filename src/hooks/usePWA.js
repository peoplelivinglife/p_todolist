import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState('unknown');

  useEffect(() => {
    // 플랫폼 감지
    const detectPlatform = () => {
      const userAgent = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
      
      if (isIOS) {
        setPlatform('ios');
      } else if (isAndroid) {
        setPlatform('android');
      } else if (isChrome) {
        setPlatform('chrome');
      } else {
        setPlatform('other');
      }
    };

    // PWA 설치 가능 여부 감지 (Chrome/Android)
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // 이미 설치된 PWA인지 확인
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      console.log('PWA: Standalone mode:', standalone);
      setIsStandalone(standalone);
    };

    console.log('PWA: Hook initialized');
    detectPlatform();
    checkStandalone();
    
    // Chrome/Android에서만 beforeinstallprompt 이벤트 리스너 등록
    if (navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Android')) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    // 설치 후 prompt 제거
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed');
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) {
      console.log('PWA: No deferred prompt available');
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      } else {
        console.log('PWA: User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('PWA 설치 오류:', error);
      return false;
    }
  };

  return {
    isInstallable,
    isStandalone,
    platform,
    installPWA
  };
};