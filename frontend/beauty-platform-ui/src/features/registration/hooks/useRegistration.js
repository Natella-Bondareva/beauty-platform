import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../auth/api/auth.api';
import { salonApi } from '../../services/api/salon.api';
import { settingsApi } from '../../settings/api/settings.api';
import { employeeApi } from '../../employees/api/employee.api';

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
    timezone: 'Europe/Kyiv'
  });
  const [workType, setWorkType] = useState('');
  const [salonId, setSalonId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [regularDaysOff, setRegularDaysOff] = useState([]);
  const [specialDaysOff, setSpecialDaysOff] = useState([]);
  const [newSpecialDate, setNewSpecialDate] = useState('');
  const [newSpecialReason, setNewSpecialReason] = useState('');
  const [categories, setCategories] = useState([]);

  // Owner self-registration (step 7 for solo/me_and_team)
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [yearsExperience, setYearsExperience] = useState('');

  // Team wizard (step 6 for team, step 8 for me_and_team)
  const [teamSubStep, setTeamSubStep] = useState(1); // 1=categories, 2=form, 3=services
  const [addedMembers, setAddedMembers] = useState([]);
  const [memberCategories, setMemberCategories] = useState([]);
  const [memberSalonCategoryIds, setMemberSalonCategoryIds] = useState([]);
  const [memberForm, setMemberFormState] = useState({ fullName: '', phone: '', email: '' });
  const [memberYears, setMemberYears] = useState('');
  const [memberCreateAccount, setMemberCreateAccount] = useState(false);
  const [memberAccountEmail, setMemberAccountEmail] = useState('');
  const [memberAccountPassword, setMemberAccountPassword] = useState('');
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  // Services to be created + assigned in sub-step 3
  // Each: { _id, categoryId, categoryName, name, description, systemDurationMinutes, clientDurationMinutes, price }
  const [pendingServices, setPendingServices] = useState([]);

  const navigate = useNavigate();

  // ── Step flow helpers ──────────────────────────────────────────────

  const getWelcomeStep = () => {
    if (workType === 'team') return 7;
    if (workType === 'me_and_team') return 9;
    return 8; // solo
  };

  const getTotalSteps = () => {
    if (workType === 'team') return 7;
    if (workType === 'me_and_team') return 9;
    return 8; // solo
  };

  const isTeamWizardActive = () =>
    (step === 6 && workType === 'team') || (step === 8 && workType === 'me_and_team');

  // ── Generic handlers ───────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'defaultSlotDurationMinutes' ? parseInt(value, 10) : value
    }));
  };

  const adjustTime = (field, deltaMinutes) => {
    const [hours, minutes] = settings[field].split(':').map(Number);
    const total = hours * 60 + minutes + deltaMinutes;
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    setSettings(prev => ({
      ...prev,
      [field]: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }));
  };

  const adjustDuration = (delta) => {
    setSettings(prev => ({
      ...prev,
      defaultSlotDurationMinutes: Math.max(15, Math.min(120, prev.defaultSlotDurationMinutes + delta))
    }));
  };

  const handleMemberFormChange = (e) => {
    const { name, value } = e.target;
    setMemberFormState(prev => ({ ...prev, [name]: value }));
  };


  // ── Days off ───────────────────────────────────────────────────────

  const handleRegularDayOffChange = async (dayOfWeek, checked) => {
    if (!salonId) return;
    try {
      if (checked) {
        await settingsApi.addRegularDayOff(salonId, dayOfWeek);
        setRegularDaysOff(prev => [...prev, dayOfWeek]);
      } else {
        await settingsApi.removeRegularDayOff(salonId, dayOfWeek);
        setRegularDaysOff(prev => prev.filter(d => d !== dayOfWeek));
      }
    } catch (err) {
      console.error(err);
      setError('Could not update regular days off');
    }
  };

  const addSpecialDayOff = async () => {
    if (!newSpecialDate || !salonId) return;
    try {
      const date = new Date(newSpecialDate).toISOString();
      const response = await settingsApi.addSpecialDayOff(salonId, date, newSpecialReason || null);
      setSpecialDaysOff(prev => [...prev, response.data]);
      setNewSpecialDate('');
      setNewSpecialReason('');
    } catch (err) {
      console.error(err);
      setError('Could not add special day off');
    }
  };

  const removeSpecialDayOff = async (id) => {
    if (!salonId) return;
    try {
      await settingsApi.removeSpecialDayOff(salonId, id);
      setSpecialDaysOff(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
      setError('Could not remove special day off');
    }
  };

  // ── Main step submitters ───────────────────────────────────────────

  const submitStep1 = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill all fields');
      return false;
    }
    const response = await authApi.register({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password
    });
    localStorage.setItem('token', response.data.token);
    return true;
  };

  const submitStep2 = async () => {
    if (!formData.salonName.trim() || !formData.phone.trim() || !formData.street.trim() || !formData.city.trim()) {
      setError('Please fill all fields');
      return false;
    }
    const salonResponse = await salonApi.create({
      name: formData.salonName.trim(),
      phone: formData.phone.trim(),
      street: formData.street.trim(),
      city: formData.city.trim()
    });
    const id = salonResponse.data.id;
    setSalonId(id);
    localStorage.setItem('salonId', id);

    const [catRes, salonRes] = await Promise.all([
      salonApi.getCategories(id),
      settingsApi.get(id)
    ]);
    setCategories(catRes.data);
    const salonData = salonRes.data || {};
    const settingsData = salonData.settings || salonData;
    setSettings({
      openingTime: settingsData.openingTime ? settingsData.openingTime.slice(0, 5) : settings.openingTime,
      closingTime: settingsData.closingTime ? settingsData.closingTime.slice(0, 5) : settings.closingTime,
      defaultSlotDurationMinutes: settingsData.defaultSlotDurationMinutes ?? settings.defaultSlotDurationMinutes,
      timezone: settingsData.timezone || settings.timezone
    });
    setRegularDaysOff(Array.isArray(settingsData.regularDaysOff)
      ? settingsData.regularDaysOff.map(d => d.dayOfWeek)
      : []);
    setSpecialDaysOff(Array.isArray(settingsData.specialDaysOff)
      ? settingsData.specialDaysOff
      : []);
    return true;
  };

  const submitStep3 = async () => {
    if (!salonId) { setError('Salon not created yet'); return false; }
    if (settings.closingTime <= settings.openingTime) {
      setError('Closing time must be after opening time');
      return false;
    }
    await settingsApi.update(salonId, {
      openingTime: `${settings.openingTime}:00`,
      closingTime: `${settings.closingTime}:00`,
      slotDurationMinutes: settings.defaultSlotDurationMinutes
    });
    return true;
  };

  const submitStep5 = () => {
    if (!workType) {
      setError('Please select an option');
      return false;
    }
    return true;
  };

  const submitStep6categories = () => {
    if (selectedCategories.length === 0) {
      setError('Будь ласка, оберіть хоча б одну категорію');
      return false;
    }
    return true;
  };

  const submitStep7selfReg = async () => {
    const hireDate = yearsExperience && parseInt(yearsExperience) > 0
      ? new Date(new Date().getFullYear() - parseInt(yearsExperience), 0, 1).toISOString()
      : null;
    await salonApi.registerSelf(salonId, {
      categoryIds: selectedCategories.map(c => c.id),
      phone: formData.phone,
      hireDate
    });
    return true;
  };

  // ── Team wizard ────────────────────────────────────────────────────

  const resetMemberState = () => {
    setTeamSubStep(1);
    setMemberCategories([]);
    setMemberSalonCategoryIds([]);
    setMemberFormState({ fullName: '', phone: '', email: '' });
    setMemberYears('');
    setMemberCreateAccount(false);
    setMemberAccountEmail('');
    setMemberAccountPassword('');
    setCurrentEmployeeId(null);
    setCurrentEmployee(null);
    setPendingServices([]);
    setError('');
  };

  const handleTeamWizardStep = async () => {
    if (teamSubStep === 1) {
      if (memberCategories.length === 0) {
        setError('Оберіть хоча б одну категорію');
        return;
      }
      setError('');
      setLoading(true);
      try {
        // Create salon categories for selected global categories
        const createPromises = memberCategories.map(cat =>
          salonApi.createCategory(salonId, {
            name: cat.name,
            description: cat.description || null,
            iconUrl: cat.iconUrl || null
          })
        );
        const createResults = await Promise.all(createPromises);
        const newCategoryIds = createResults.map(res => res.data.id);
        setMemberSalonCategoryIds(newCategoryIds);
        setTeamSubStep(2);
      } catch (err) {
        setError('Не вдалось створити категорії для майстра');
        console.error(err);
      } finally {
        setLoading(false);
      }

    } else if (teamSubStep === 2) {
      if (!memberForm.fullName.trim() || !memberForm.phone.trim()) {
        setError("Ім'я та телефон є обов'язковими");
        return;
      }
      if (memberCreateAccount && (!memberAccountEmail.trim() || !memberAccountPassword.trim())) {
        setError('Для облікового запису вкажіть email та пароль');
        return;
      }

      const hireDate = memberYears && parseInt(memberYears) > 0
        ? new Date(new Date().getFullYear() - parseInt(memberYears), 0, 1).toISOString()
        : new Date().toISOString();

      const body = {
        categoryIds: memberSalonCategoryIds,
        fullName: memberForm.fullName.trim(),
        phone: memberForm.phone.trim(),
        email: memberForm.email.trim() || null,
        hireDate,
        avatarUrl: null,
        userAccount: memberCreateAccount
          ? { email: memberAccountEmail.trim(), password: memberAccountPassword }
          : null
      };

      const createRes = await salonApi.createEmployee(salonId, body);
      const employeeId = createRes.data.id;

      // Pre-populate pending services from each selected category's defaultServices
      const pending = [];
      memberCategories.forEach((cat, idx) => {
        const salonCatId = memberSalonCategoryIds[idx];
        (cat.defaultServices || []).forEach(ds => {
          pending.push({
            _id: `${ds.id}_${idx}_${Date.now()}`,
            categoryId: salonCatId,
            categoryName: cat.name,
            name: ds.name,
            description: '',
            systemDurationMinutes: ds.systemDurationMinutes,
            clientDurationMinutes: ds.clientDurationMinutes,
            price: ds.suggestedPrice,
          });
        });
      });
      setPendingServices(pending);

      const empRes = await employeeApi.getById(salonId, employeeId);
      setCurrentEmployeeId(employeeId);
      setCurrentEmployee(empRes.data);
      setError('');
      setTeamSubStep(3);

    } else if (teamSubStep === 3) {
      // Create each pending service in the salon, then assign it to the employee
      setLoading(true);
      try {
        for (const svc of pendingServices) {
          const createRes = await salonApi.createService(salonId, {
            categoryId: svc.categoryId,
            name: svc.name,
            description: svc.description || null,
            systemDurationMinutes: Number(svc.systemDurationMinutes),
            clientDurationMinutes: Number(svc.clientDurationMinutes),
            price: Number(svc.price),
          });
          await employeeApi.assignService(salonId, currentEmployeeId, createRes.data.id, {
            priceOverride: null,
            systemDurationOverride: null,
            clientDurationOverride: null,
          });
        }
        setAddedMembers(prev => [...prev, { fullName: currentEmployee?.fullName || '' }]);
        const welcome = getWelcomeStep();
        resetMemberState();
        setStep(welcome);
      } catch (err) {
        setError(err?.response?.data?.error || 'Помилка збереження послуг');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddAnotherMember = () => {
    setAddedMembers(prev => [...prev, { fullName: currentEmployee?.fullName || '' }]);
    resetMemberState(); // resets teamSubStep to 1
  };

  // ── Pending-service management (team wizard sub-step 3) ──────────────

  const onUpdatePendingService = (_id, updates) =>
    setPendingServices(prev => prev.map(s => s._id === _id ? { ...s, ...updates } : s));

  const onRemovePendingService = (_id) =>
    setPendingServices(prev => prev.filter(s => s._id !== _id));

  const onAddPendingService = (newSvc) =>
    setPendingServices(prev => [...prev, { _id: `custom_${Date.now()}`, ...newSvc }]);

  // ── Main submit handler ────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (step === 1) {
        if (await submitStep1()) setStep(2);
      } else if (step === 2) {
        if (await submitStep2()) setStep(3);
      } else if (step === 3) {
        if (await submitStep3()) setStep(4);
      } else if (step === 4) {
        setStep(5);
      } else if (step === 5) {
        if (submitStep5()) setStep(6);
      } else if (step === 6) {
        if (workType === 'team') {
          await handleTeamWizardStep();
        } else {
          if (submitStep6categories()) setStep(7);
        }
      } else if (step === 7) {
        if (workType === 'team') {
          navigate('/dashboard');
        } else {
          if (await submitStep7selfReg()) setStep(8);
        }
      } else if (step === 8) {
        if (workType === 'me_and_team') {
          await handleTeamWizardStep();
        } else {
          navigate('/dashboard'); // solo welcome
        }
      } else {
        navigate('/dashboard'); // step 9 — me_and_team welcome
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    if (isTeamWizardActive()) {
      if (teamSubStep === 1) {
        setStep(prev => Math.max(1, prev - 1));
      } else if (teamSubStep === 2) {
        setTeamSubStep(1);
      }
      // sub-step 3: employee already created, no going back
    } else {
      setStep(prev => Math.max(1, prev - 1));
    }
  };

  return {
    step,
    formData,
    settings,
    workType,
    setWorkType,
    categories,
    selectedCategories,
    setSelectedCategories,
    yearsExperience,
    setYearsExperience,
    // Team wizard
    teamSubStep,
    addedMembers,
    memberCategories,
    setMemberCategories,
    memberForm,
    onMemberFormChange: handleMemberFormChange,
    memberYears,
    setMemberYears,
    memberCreateAccount,
    setMemberCreateAccount,
    memberAccountEmail,
    setMemberAccountEmail,
    memberAccountPassword,
    setMemberAccountPassword,
    currentEmployee,
    memberSalonCategoryIds,
    pendingServices,
    onUpdatePendingService,
    onRemovePendingService,
    onAddPendingService,
    onAddAnotherMember: handleAddAnotherMember,
    isTeamWizardActive,
    // Shared
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
    handleSubmit,
    handlePrev,
    getTotalSteps,
    getWelcomeStep,
   };
}
