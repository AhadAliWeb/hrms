import { useState, useEffect } from "react";
import { getEmployees } from "../../api/employee";
import { register } from "../../api/auth";

const ROLES = [
  { value: "Admin", label: "Admin", icon: "🛡️", desc: "Full system access" },
  { value: "HRManager", label: "HR Manager", icon: "👥", desc: "Manage people & payroll" },
  { value: "Employee", label: "Employee", icon: "👤", desc: "Standard access" },
];

export default function AddUser() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "",
    employeeId: null,
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await getEmployees();
        setEmployees(res.data);
      } catch (err) {
        console.error("Failed to fetch employees", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  console.log(employees);
  

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required.";
    else if (form.username.length < 3) newErrors.username = "At least 3 characters.";
    if (!form.password) newErrors.password = "Password is required.";
    else if (form.password.length < 6) newErrors.password = "At least 6 characters.";
    if (!form.role) newErrors.role = "Please select a role.";
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const payload = {
      username: form.username,
      password: form.password,
      role: form.role,
      employeeId: form.employeeId ? Number(form.employeeId) : null,
    };

    try {
      // Replace with your actual API call, e.g.:
      // await createUser(payload);
      console.log("Submitting:", payload);
      await register(payload);
      setToast({ type: "success", message: "User created successfully!" });
      setForm({ username: "", password: "", role: "", employeeId: null });
    } catch (err) {
      setToast({ type: "error", message: "Failed to create user. Try again." });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 flex items-center justify-center p-6 font-sans">

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-medium transition-all duration-300 ${
            toast.type === "success" ? "bg-indigo-600" : "bg-red-500"
          }`}
        >
          <span>{toast.type === "success" ? "✅" : "❌"}</span>
          {toast.message}
        </div>
      )}

      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-indigo-900 tracking-tight">Add New User</h1>
          <p className="text-sm text-indigo-400 mt-1">Create a system account and link it to an employee</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-100 p-8 space-y-7">

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-indigo-700 uppercase tracking-widest mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="e.g. john_doe"
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-gray-800 placeholder-indigo-200 focus:outline-none focus:ring-2 transition ${
                  errors.username
                    ? "border-red-400 focus:ring-red-300 bg-red-50"
                    : "border-indigo-200 focus:ring-indigo-400 focus:border-indigo-400 bg-indigo-50/40"
                }`}
              />
            </div>
            {errors.username && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {errors.username}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-indigo-700 uppercase tracking-widest mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm text-gray-800 placeholder-indigo-200 focus:outline-none focus:ring-2 transition ${
                  errors.password
                    ? "border-red-400 focus:ring-red-300 bg-red-50"
                    : "border-indigo-200 focus:ring-indigo-400 focus:border-indigo-400 bg-indigo-50/40"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-indigo-500 transition"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {errors.password}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-indigo-700 uppercase tracking-widest mb-3">
              Role
            </label>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((role) => {
                const selected = form.role === role.value;
                return (
                  <label
                    key={role.value}
                    className={`relative cursor-pointer rounded-xl border-2 p-3.5 text-center transition-all duration-150 select-none ${
                      selected
                        ? "border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-200"
                        : "border-indigo-100 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={selected}
                      onChange={(e) => handleChange("role", e.target.value)}
                      className="sr-only"
                    />
                    {selected && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full" />
                    )}
                    <div className="text-xl mb-1">{role.icon}</div>
                    <div className={`text-xs font-bold tracking-wide ${selected ? "text-indigo-700" : "text-gray-600"}`}>
                      {role.label}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{role.desc}</div>
                  </label>
                );
              })}
            </div>
            {errors.role && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {errors.role}
              </p>
            )}
          </div>

          {/* Employee */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-indigo-700 uppercase tracking-widest">
                Link Employee
              </label>
              <span className="text-[10px] text-indigo-300 font-medium italic">Optional</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <select
                value={form.employeeId ?? ""}
                onChange={(e) =>
                  handleChange("employeeId", e.target.value ? Number(e.target.value) : null)
                }
                disabled={loading}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-indigo-200 bg-indigo-50/40 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">{loading ? "Loading employees…" : "— No employee linked —"}</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} — {emp.designationTitle}
                  </option>
                ))}
              </select>
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>

            {/* Selected employee badge */}
            {form.employeeId && (() => {
              const emp = employees.find((e) => e.id === form.employeeId);
              return emp ? (
                <div className="mt-2.5 flex items-center gap-2.5 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {emp.firstName[0]}{emp.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-indigo-800 truncate">
                      {emp.firstName} {emp.lastName}
                    </p>
                    <p className="text-xs text-indigo-400 truncate">
                      {emp.designationTitle} · {emp.departmentName}
                    </p>
                  </div>
                  <span className={`ml-auto flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${emp.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                    {emp.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ) : null;
            })()}
          </div>

          {/* Divider */}
          <div className="border-t border-indigo-100" />

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setForm({ username: "", password: "", role: "", employeeId: null });
                setErrors({});
              }}
              className="flex-1 py-3 rounded-xl border-2 border-indigo-200 text-indigo-500 text-sm font-semibold hover:bg-indigo-50 hover:border-indigo-300 transition"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-bold tracking-wide shadow-lg shadow-indigo-200 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Create User
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-indigo-300 mt-5">
          Linking an employee is optional — accounts can be linked later.
        </p>
      </div>
    </div>
  );
}