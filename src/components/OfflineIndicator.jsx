import { useOffline } from '../hooks/useOffline';

export const OfflineIndicator = () => {
  const { isOffline } = useOffline();

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 text-sm z-50">
      📡 오프라인 상태입니다
    </div>
  );
};