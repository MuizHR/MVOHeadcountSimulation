import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  ROLE_OPTIONS,
  getSalaryBandSummary,
  formatMoney,
  EmploymentTypeKey,
  RoleKey,
  RoleOption
} from '../config/staffCost';

interface AddRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (roleOption: RoleOption) => void;
}

export function AddRoleDialog({ isOpen, onClose, onAdd }: AddRoleDialogProps) {
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<EmploymentTypeKey>('permanent');
  const [selectedBandKey, setSelectedBandKey] = useState<RoleKey | ''>('');

  const filteredRoles = ROLE_OPTIONS.filter(opt => opt.employmentType === selectedEmploymentType);

  const selectedOption = selectedBandKey
    ? ROLE_OPTIONS.find(o => o.bandKey === selectedBandKey && o.employmentType === selectedEmploymentType) ?? null
    : null;

  const bandSummary = selectedOption
    ? getSalaryBandSummary(selectedOption.employmentType, selectedOption.bandKey)
    : null;

  const handleAdd = () => {
    if (selectedOption) {
      onAdd(selectedOption);
      setSelectedBandKey('');
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedBandKey('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add Role to Pattern</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type
                </label>
                <select
                  value={selectedEmploymentType}
                  onChange={(e) => {
                    setSelectedEmploymentType(e.target.value as EmploymentTypeKey);
                    setSelectedBandKey('');
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
                >
                  <option value="permanent">Permanent</option>
                  <option value="gig">GIG</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JLG Role / Band
                </label>
                <select
                  value={selectedBandKey}
                  onChange={(e) => setSelectedBandKey(e.target.value as RoleKey)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
                >
                  <option value="">Select a role...</option>
                  {filteredRoles.map((opt) => (
                    <option key={opt.bandKey} value={opt.bandKey}>
                      {opt.label.replace(` (${selectedEmploymentType === 'permanent' ? 'Permanent' : 'GIG'})`, '')} – {opt.level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-lg border-2 border-slate-200 bg-slate-50 px-4 py-4">
              <div className="mb-2 font-semibold text-gray-900">Salary Band Details</div>

              {!bandSummary && (
                <p className="text-sm text-slate-500 italic">
                  Select a role to view salary range and employer cost breakdown.
                </p>
              )}

              {bandSummary && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Salary Range:</span>
                    <span className="font-medium text-gray-900 text-right">
                      {formatMoney(bandSummary.min)} – {formatMoney(bandSummary.max)}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Midpoint:</span>
                    <span className="font-medium text-teal-700 text-right">
                      {formatMoney(bandSummary.midpoint)}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Fixed Allowance:</span>
                    <span className="font-medium text-gray-900 text-right">
                      {formatMoney(bandSummary.allowance)} / month
                    </span>
                  </div>

                  <div className="border-t-2 border-slate-300 pt-2 mt-2">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-700 font-medium">Est. Employer Cost / FTE:</span>
                      <span className="font-bold text-teal-700 text-lg text-right">
                        {formatMoney(bandSummary.monthlyCost)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-300 pt-2 mt-3 text-xs text-slate-600 space-y-1">
                    <div className="font-medium text-slate-700 mb-1">Cost breakdown includes:</div>
                    <div>• Statutory (EPF/SOCSO/EIS/HRD): {bandSummary.statRate * 100}%</div>
                    <div>• GPA / GTL (insurance): {bandSummary.gpaRate * 100}%</div>
                    <div>• GHS (medical insurance): {bandSummary.ghsRate * 100}%</div>
                    <div>• Medical benefit: {formatMoney(bandSummary.medical)} / month</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!selectedOption}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add Role
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
