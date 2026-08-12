import { useState, type FormEvent } from "react";
import { LockKeyhole } from "lucide-react";
import { useI18n } from "./i18n";

interface Props {
  configured: boolean;
  busy: boolean;
  onSubmit: (password: string) => Promise<void>;
  onCancel: () => void;
}

export function AdminLoginForm({ configured, busy, onSubmit, onCancel }: Props) {
  const { t } = useI18n();
  const [password, setPassword] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!configured || !password) return;
    await onSubmit(password);
  }

  return (
    <form className="drawer-form admin-login-form" onSubmit={submit}>
      <div className="admin-login-intro">
        <span><LockKeyhole size={22} /></span>
        <div><strong>{t("adminIntroTitle")}</strong><p>{t("adminIntroBody")}</p></div>
      </div>
      {configured ? (
        <label className="field">
          <span>{t("adminPassword")}</span>
          <input
            autoFocus
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("adminPasswordPlaceholder")}
          />
        </label>
      ) : (
        <div className="auth-not-configured"><strong>{t("authNotConfigured")}</strong><p>{t("authNotConfiguredBody")}</p></div>
      )}
      <div className="form-actions">
        <button className="button button--ghost" type="button" onClick={onCancel}>{t("cancel")}</button>
        <button className="button button--primary" disabled={!configured || busy || !password}>{busy ? t("verifying") : t("enterAdminMode")}</button>
      </div>
    </form>
  );
}
