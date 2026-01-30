import React, { useState } from 'react';
import { Phone, User, X, Plus, AlertTriangle, Shield } from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary?: boolean;
}

interface EmergencyContactFormProps {
  contacts: EmergencyContact[];
  onChange: (contacts: EmergencyContact[]) => void;
  maxContacts?: number;
  className?: string;
}

const RELATIONSHIPS = [
  'Parent',
  'Spouse/Partner',
  'Sibling',
  'Child',
  'Friend',
  'Relative',
  'Neighbor',
  'Colleague',
  'Other',
];

const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({
  contacts,
  onChange,
  maxContacts = 3,
  className = '',
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+63|0)?[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid Philippine phone number';
    }

    if (!formData.relationship) {
      newErrors.relationship = 'Please select a relationship';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) return;

    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      relationship: formData.relationship,
      isPrimary: contacts.length === 0,
    };

    onChange([...contacts, newContact]);
    setFormData({ name: '', phone: '', relationship: '' });
    setIsAdding(false);
    setErrors({});
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
    });
  };

  const handleUpdate = () => {
    if (!validateForm() || !editingId) return;

    const updated = contacts.map(c =>
      c.id === editingId
        ? { ...c, name: formData.name.trim(), phone: formData.phone.trim(), relationship: formData.relationship }
        : c
    );

    onChange(updated);
    setEditingId(null);
    setFormData({ name: '', phone: '', relationship: '' });
    setErrors({});
  };

  const handleRemove = (id: string) => {
    const wasRemovingPrimary = contacts.find(c => c.id === id)?.isPrimary;
    let updated = contacts.filter(c => c.id !== id);
    
    // If removed primary, make first remaining contact primary
    if (wasRemovingPrimary && updated.length > 0) {
      updated = updated.map((c, i) => ({ ...c, isPrimary: i === 0 }));
    }

    onChange(updated);
  };

  const handleSetPrimary = (id: string) => {
    const updated = contacts.map(c => ({ ...c, isPrimary: c.id === id }));
    onChange(updated);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', phone: '', relationship: '' });
    setErrors({});
  };

  const renderForm = (isEdit: boolean = false) => (
    <div className="card p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-deep-slate mb-1.5">
          Contact Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-slate/40" />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`input-field pl-10 ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Full name"
          />
        </div>
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-deep-slate mb-1.5">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-slate/40" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`input-field pl-10 ${errors.phone ? 'border-red-500' : ''}`}
            placeholder="+63 or 09XX XXX XXXX"
          />
        </div>
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-deep-slate mb-1.5">
          Relationship <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.relationship}
          onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
          className={`input-field ${errors.relationship ? 'border-red-500' : ''}`}
        >
          <option value="">Select relationship</option>
          {RELATIONSHIPS.map(rel => (
            <option key={rel} value={rel}>{rel}</option>
          ))}
        </select>
        {errors.relationship && <p className="text-red-500 text-xs mt-1">{errors.relationship}</p>}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={isEdit ? handleUpdate : handleAdd}
          className="btn btn-primary flex-1"
        >
          {isEdit ? 'Update Contact' : 'Add Contact'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="btn btn-outline"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-burnt-orange" />
        <h3 className="font-semibold text-deep-slate">Emergency Contacts</h3>
        <span className="text-sm text-deep-slate/60">
          ({contacts.length}/{maxContacts})
        </span>
      </div>

      {/* Info Banner */}
      {contacts.length === 0 && !isAdding && (
        <div className="bg-burnt-orange/10 border border-burnt-orange/20 rounded-lg p-4 mb-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-burnt-orange flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-deep-slate mb-1">Add emergency contacts</p>
            <p className="text-deep-slate/60">
              Your emergency contacts will be notified if you trigger an SOS alert. 
              Add at least one trusted contact.
            </p>
          </div>
        </div>
      )}

      {/* Contact List */}
      <div className="space-y-3 mb-4">
        {contacts.map(contact => (
          <div
            key={contact.id}
            className={`card p-4 ${contact.isPrimary ? 'border-2 border-primary' : ''}`}
          >
            {editingId === contact.id ? (
              renderForm(true)
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-deep-slate">{contact.name}</p>
                      {contact.isPrimary && (
                        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-deep-slate/60">{contact.relationship}</p>
                    <p className="text-sm text-primary">{contact.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!contact.isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(contact.id)}
                      className="text-xs text-primary hover:text-primary-dark"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleEdit(contact)}
                    className="text-sm text-primary hover:text-primary-dark"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(contact.id)}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Form */}
      {isAdding && !editingId && renderForm()}

      {/* Add Button */}
      {!isAdding && !editingId && contacts.length < maxContacts && (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="btn btn-outline w-full justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Emergency Contact
        </button>
      )}
    </div>
  );
};

export default EmergencyContactForm;
