import { useState, useEffect } from 'react';
import { subscriptionApi } from '../api/subscription.api';

export function useSubscriptionStep(salonId) {
  const [config, setConfig] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [extraMasters, setExtraMasters] = useState(0);
  const [selectedModules, setSelectedModules] = useState([]);
  const [months, setMonths] = useState(1);
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [error, setError] = useState('');

  // Завантажуємо конфігурацію і підписку паралельно
  useEffect(() => {
    if (!salonId) {
      setConfigLoading(false);
      return;
    }
    const load = async () => {
      setConfigLoading(true);
      try {
        const [configRes, subRes] = await Promise.all([
          subscriptionApi.getConfig(),
          subscriptionApi.get(salonId),
        ]);
        setConfig(configRes.data);
        setSubscription(subRes.data);
      } catch (err) {
        setError('Failed to load subscription config');
      } finally {
        setConfigLoading(false);
      }
    };
    load();
  }, [salonId]);

  // Ціни рахуються на основі даних з бекенду
  const calculatePrice = () => {
    if (!config) return 0;

    const masterPrice = extraMasters * config.pricePerMaster * months;
    const modulesPrice = selectedModules.reduce((sum, id) => {
      const mod = config.paidModules.find(m => m.id === id);
      return sum + (mod?.price ?? 0) * months;
    }, 0);

    return masterPrice + modulesPrice;
  };

  const toggleModule = (moduleId) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  const saveSubscription = async () => {
    setLoading(true);
    setError('');
    try {
      if (extraMasters > 0) {
        await subscriptionApi.addMasterSlots(salonId, extraMasters, months);
      }
      for (const moduleId of selectedModules) {
        await subscriptionApi.addModule(salonId, moduleId, months);
      }
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save subscription');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    config,          // вся конфігурація з бекенду
    subscription,    // поточна підписка
    configLoading,
    extraMasters,
    setExtraMasters,
    selectedModules,
    toggleModule,
    months,
    setMonths,
    totalPrice: calculatePrice(),
    loading,
    error,
    saveSubscription,
  };
}
