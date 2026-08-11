import { useState, type FormEvent } from "react";
import { LockKeyhole } from "lucide-react";

interface Props {
  configured: boolean;
  busy: boolean;
  onSubmit: (password: string) => Promise<void>;
  onCancel: () => void;
}

export function AdminLoginForm({ configured, busy, onSubmit, onCancel }: Props) {
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
        <div><strong>进入管理模式</strong><p>族人默认以浏览模式访问，可查看族谱和查询称呼。管理员登录后才可修改成员、关系和族谱设置。</p></div>
      </div>
      {configured ? (
        <label className="field">
          <span>管理员密码</span>
          <input
            autoFocus
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="请输入管理员密码"
          />
        </label>
      ) : (
        <div className="auth-not-configured"><strong>尚未配置管理员密码</strong><p>请在服务端环境变量中设置 ADMIN_PASSWORD 和 SESSION_SECRET 后重启服务。</p></div>
      )}
      <div className="form-actions">
        <button className="button button--ghost" type="button" onClick={onCancel}>取消</button>
        <button className="button button--primary" disabled={!configured || busy || !password}>{busy ? "验证中…" : "进入管理模式"}</button>
      </div>
    </form>
  );
}
