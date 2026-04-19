import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { salonApi } from '../api/salon.api';
import { settingsApi } from '../api/settings.api';
import { employeeApi } from '../api/employee.api';

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
  const [memberForm, setMemberFormState] = useState({ fullName: '', phone: '', email: '' });
  const [memberYears, setMemberYears] = useState('');
  const [memberCreateAccount, setMemberCreateAccount] = useState(false);
  const [memberAccountEmail, setMemberAccountEmail] = useState('');
  const [memberAccountPassword, setMemberAccountPassword] = useState('');
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [salonServicesList, setSalonServicesList] = useState([]);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editingServiceForm, setEditingServiceFormState] = useState({
    name: '', description: '', systemDurationMinutes: '', clientDurationMinutes: '', price: '', category: ''
  });
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [customServiceForm, setCustomServiceFormState] = useState({
    name: '', description: '', systemDurationMinutes: '', clientDurationMinutes: '', price: '', category: ''
  });

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

  const handleCustomServiceFormChange = (e) => {
    const { name, value } = e.target;
    setCustomServiceFormState(prev => ({ ...prev, [name]: value }));
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

    const [catRes, settingsRes] = await Promise.all([
      salonApi.getCategories(id),
      settingsApi.get(id)
    ]);
    setCategories(catRes.data);
    setSettings({
      openingTime: settingsRes.data.openingTime.slice(0, 5),
      closingTime: settingsRes.data.closingTime.slice(0, 5),
      defaultSlotDurationMinutes: settingsRes.data.defaultSlotDurationMinutes,
      timezone: settingsRes.data.timezone
    });
    setRegularDaysOff(settingsRes.data.regularDaysOff.map(d => d.dayOfWeek));
    setSpecialDaysOff(settingsRes.data.specialDaysOff);
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
    setMemberFormState({ fullName: '', phone: '', email: '' });
    setMemberYears('');
    setMemberCreateAccount(false);
    setMemberAccountEmail('');
    setMemberAccountPassword('');
    setCurrentEmployeeId(null);
    setCurrentEmployee(null);
    setSalonServicesList([]);
    setEditingServiceId(null);
    setEditingServiceFormState({ name: '', description: '', systemDurationMinutes: '', clientDurationMinutes: '', price: '', category: '' });
    setShowAddServiceForm(false);
    setCustomServiceFormState({ name: '', description: '', systemDurationMinutes: '', clientDurationMinutes: '', price: '', category: '' });
    setError('');
  };

  const handleTeamWizardStep = async () => {
    if (teamSubStep === 1) {
      if (memberCategories.length === 0) {
        setError('Оберіть хоча б одну категорію');
        return;
      }
      setError('');
      setTeamSubStep(2);

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
        categoryIds: memberCategories.map(c => c.id),
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

      const [empRes, servicesRes] = await Promise.all([
        employeeApi.getById(salonId, employeeId),
        salonApi.getServices(salonId)
      ]);

      setCurrentEmployeeId(employeeId);
      setCurrentEmployee(empRes.data);
      setSalonServicesList(servicesRes.data);
      setError('');
      setTeamSubStep(3);

    } else if (teamSubStep === 3) {
      // "Done" — record member and advance to welcome
      setAddedMembers(prev => [...prev, { fullName: currentEmployee?.fullName || '' }]);
      const welcome = getWelcomeStep();
      resetMemberState();
      setStep(welcome);
    }
  };

  const handleAddAnotherMember = () => {
    setAddedMembers(prev => [...prev, { fullName: currentEmployee?.fullName || '' }]);
    resetMemberState(); // resets teamSubStep to 1
  };

  // ── Service management (team wizard sub-step 3) ────────────────────

  const onStartEditService = (svc, fullService) => {
    setEditingServiceId(svc.serviceId);
    setEditingServiceFormState({
      name: fullService?.name || svc.serviceName,
      description: fullService?.description || '',
      systemDurationMinutes: String(svc.systemDurationMinutes),
      clientDurationMinutes: String(svc.clientDurationMinutes),
      price: String(svc.effectivePrice),
      category: fullService?.category || ''
    });
  };

  const onEditingServiceFormChange = (field, value) => {
    setEditingServiceFormState(prev => ({ ...prev, [field]: value }));
  };

  const onCancelEditService = () => {
    setEditingServiceId(null);
  };

  const onSaveEditService = async () => {
    const { name, systemDurationMinutes, clientDurationMinutes, price } = editingServiceForm;
    if (!name.trim() || !systemDurationMinutes || !clientDurationMinutes || !price) {
      setError("Заповніть обов'язкові поля: назва, тривалість, ціна");
      return;
    }
    const sysMin = parseInt(systemDurationMinutes);
    const cliMin = parseInt(clientDurationMinutes);
    if (cliMin > sysMin) {
      setError('Клієнтська тривалість не може перевищувати системну');
      return;
    }
    setLoading(true);
    try {
      await salonApi.updateService(salonId, editingServiceId, {
        name: name.trim(),
        description: editingServiceForm.description.trim() || null,
        systemDurationMinutes: sysMin,
        clientDurationMinutes: cliMin,
        price: parseFloat(price),
        category: editingServiceForm.category.trim() || null
      });
      const [empRes, servicesRes] = await Promise.all([
        employeeApi.getById(salonId, currentEmployeeId),
        salonApi.getServices(salonId)
      ]);
      setCurrentEmployee(empRes.data);
      setSalonServicesList(servicesRes.data);
      setEditingServiceId(null);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.error || 'Не вдалось оновити послугу');
    } finally {
      setLoading(false);
    }
  };

  const onRemoveService = async (serviceId) => {
    try {
      await employeeApi.removeService(salonId, currentEmployeeId, serviceId);
      setCurrentEmployee(prev => ({
        ...prev,
        services: prev.services.filter(s => s.serviceId !== serviceId)
      }));
    } catch (err) {
      setError(err?.response?.data?.error || 'Не вдалось видалити послугу');
    }
  };

  const onAddCustomService = async () => {
    const { name, description, systemDurationMinutes, clientDurationMinutes, price, category } = customServiceForm;
    if (!name.trim() || !systemDurationMinutes || !clientDurationMinutes || !price) {
      setError("Заповніть обов'язкові поля: назва, тривалість, ціна");
      return;
    }
    const sysMin = parseInt(systemDurationMinutes);
    const cliMin = parseInt(clientDurationMinutes);
    if (cliMin > sysMin) {
      setError('Клієнтська тривалість не може перевищувати системну');
      return;
    }
    setLoading(true);
    try {
      const svcRes = await salonApi.createService(salonId, {
        name: name.trim(),
        description: description.trim() || null,
        systemDurationMinutes: sysMin,
        clientDurationMinutes: cliMin,
        price: parseFloat(price),
        category: category.trim() || null
      });
      const newServiceId = svcRes.data.id;

      await employeeApi.assignService(salonId, currentEmployeeId, newServiceId, { priceOverride: null });

      const [empRes, servicesRes] = await Promise.all([
        employeeApi.getById(salonId, currentEmployeeId),
        salonApi.getServices(salonId)
      ]);
      setCurrentEmployee(empRes.data);
      setSalonServicesList(servicesRes.data);
      setShowAddServiceForm(false);
      setCustomServiceFormState({ name: '', description: '', systemDurationMinutes: '', clientDurationMinutes: '', price: '', category: '' });
      setError('');
    } catch (err) {
      setError(err?.response?.data?.error || 'Не вдалось додати послугу');
    } finally {
      setLoading(false);
    }
  };

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
    salonServicesList,
    editingServiceId,
    editingServiceForm,
    onStartEditService,
    onEditingServiceFormChange,
    onSaveEditService,
    onCancelEditService,
    onRemoveService,
    showAddServiceForm,
    setShowAddServiceForm,
    customServiceForm,
    onCustomServiceFormChange: handleCustomServiceFormChange,
    onAddCustomService,
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
