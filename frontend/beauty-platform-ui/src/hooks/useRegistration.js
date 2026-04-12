import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export function useRegistration() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    salonName: '',
    phone: '',
    street: '',
    city: ''
  });
  const [settings, setSettings] = useState({
    openingTime: '10:00',
    closingTime: '20:00',
    defaultSlotDurationMinutes: 30,
    timezone: 'Europe/Kyiv',
    breakTimes: [],
    holidays: []
  });
  const [workType, setWorkType] = useState('');
  const [salonId, setSalonId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [regularDaysOff, setRegularDaysOff] = useState([]);
  const [specialDaysOff, setSpecialDaysOff] = useState([]);
  const [newSpecialDate, setNewSpecialDate] = useState('');
  const [newSpecialReason, setNewSpecialReason] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDefaultSettings = async () => {
      try {
        const response = await api.get('/salons/default/settings');
        setSettings({
          ...response.data,
          openingTime: response.data.openingTime.slice(0, 5),
          closingTime: response.data.closingTime.slice(0, 5)
        });
      } catch (err) {
        console.error('Failed to fetch default settings', err);
      }
    };
    fetchDefaultSettings();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: name === 'defaultSlotDurationMinutes' ? parseInt(value) : value
    });
  };

  const adjustTime = (field, deltaMinutes) => {
    const [hours, minutes] = settings[field].split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + deltaMinutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    const newTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    setSettings({
      ...settings,
      [field]: newTime
    });
  };

  const adjustDuration = (delta) => {
    const newDuration = Math.max(15, Math.min(120, settings.defaultSlotDurationMinutes + delta));
    setSettings({
      ...settings,
      defaultSlotDurationMinutes: newDuration
    });
  };

  const handleRegularDayOffChange = async (dayOfWeek, checked) => {
    const token = localStorage.getItem('token');
    if (checked) {
      try {
        await api.post(`/salons/${salonId}/settings/regular-days-off`, { dayOfWeek }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRegularDaysOff([...regularDaysOff, dayOfWeek]);
      } catch (err) {
        console.error('Failed to add regular day off', err);
      }
    } else {
      try {
        await api.delete(`/salons/${salonId}/settings/regular-days-off/${dayOfWeek}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRegularDaysOff(regularDaysOff.filter(d => d !== dayOfWeek));
      } catch (err) {
        console.error('Failed to remove regular day off', err);
      }
    }
  };

  const addSpecialDayOff = async () => {
    if (!newSpecialDate) return;
    const token = localStorage.getItem('token');
    try {
      const date = new Date(newSpecialDate).toISOString();
      await api.post(`/salons/${salonId}/settings/special-days-off`, { date, reason: newSpecialReason || null }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpecialDaysOff([...specialDaysOff, { date, reason: newSpecialReason }]);
      setNewSpecialDate('');
      setNewSpecialReason('');
    } catch (err) {
      console.error('Failed to add special day off', err);
    }
  };

  const removeSpecialDayOff = async (date) => {
    const token = localStorage.getItem('token');
    try {
      await api.delete(`/salons/${salonId}/settings/special-days-off/${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpecialDaysOff(specialDaysOff.filter(d => d.date !== date));
    } catch (err) {
      console.error('Failed to remove special day off', err);
    }
  };

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^\+380\d{9}$/;
    return re.test(phone);
  };

  const validateSettings = () => {
    if (settings.closingTime <= settings.openingTime) {
      setError('Closing time must be after opening time');
      return false;
    }
    if (settings.defaultSlotDurationMinutes <= 0) {
      setError('Slot duration must be greater than 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password.trim()) {
        setError('Please fill all fields');
        return;
      }
      if (!validateEmail(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      setLoading(true);
      try {
        const response = await api.post('/auth/register', {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          password: formData.password
        });
        console.log('Registration successful:', response.data);
        localStorage.setItem('token', response.data.token);
        handleNext();
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      if (!formData.salonName.trim() || !formData.phone.trim() || !formData.street.trim() || !formData.city.trim()) {
        setError('Please fill all fields');
        return;
      }
      if (!validatePhone(formData.phone)) {
        setError('Please enter a valid Ukrainian phone number (+380XXXXXXXXX)');
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await api.post('/salons', {
          name: formData.salonName.trim(),
          phone: formData.phone.trim(),
          street: formData.street.trim(),
          city: formData.city.trim()
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Salon created:', response.data);
        setSalonId(response.data.id);
        const settingsResponse = await api.get(`/salons/${response.data.id}/settings`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSettings({
          ...settingsResponse.data,
          openingTime: settingsResponse.data.openingTime.slice(0, 5),
          closingTime: settingsResponse.data.closingTime.slice(0, 5)
        });
        try {
          const regularResponse = await api.get(`/salons/${response.data.id}/settings/regular-days-off`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setRegularDaysOff(regularResponse.data.map(d => d.dayOfWeek));
        } catch (err) {
          console.log('No regular days off yet');
        }
        try {
          const specialResponse = await api.get(`/salons/${response.data.id}/settings/special-days-off`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSpecialDaysOff(specialResponse.data);
        } catch (err) {
          console.log('No special days off yet');
        }
        handleNext();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to create salon');
      } finally {
        setLoading(false);
      }
    } else if (step === 3) {
      if (!validateSettings()) {
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        await api.put(`/salons/${salonId}/settings`, {
          openingTime: settings.openingTime + ':00',
          closingTime: settings.closingTime + ':00',
          slotDurationMinutes: settings.defaultSlotDurationMinutes
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        handleNext();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to update settings');
      } finally {
        setLoading(false);
      }
    } else if (step === 4) {
      handleNext();
    } else if (step === 5) {
      if (!workType) {
        setError('Please select an option');
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        await api.put(`/salons/${salonId}`, {
          workType: workType
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        handleNext();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to update salon');
      } finally {
        setLoading(false);
      }
    } else if (step === 6) {
      navigate('/dashboard');
    }
  };

  return {
    step,
    formData,
    settings,
    workType,
    setWorkType,
    salonId,
    error,
    loading,
    regularDaysOff,
    specialDaysOff,
    newSpecialDate,
    newSpecialReason,
    setNewSpecialDate,
    setNewSpecialReason,
    handleChange,
    handleSettingsChange,
    adjustTime,
    adjustDuration,
    handleRegularDayOffChange,
    addSpecialDayOff,
    removeSpecialDayOff,
    handleNext,
    handlePrev,
    handleSubmit
  };
}