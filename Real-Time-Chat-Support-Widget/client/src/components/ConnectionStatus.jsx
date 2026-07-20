const STATUS_CONFIG = {
  connected: { label: 'Connected', color: 'bg-online', pulse: false },
  connecting: { label: 'Connecting…', color: 'bg-pending', pulse: true },
  reconnecting: { label: 'Reconnecting…', color: 'bg-pending', pulse: true },
  disconnected: { label: 'Disconnected', color: 'bg-offline', pulse: false },
};

export default function ConnectionStatus({ status, className = '' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.disconnected;

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium text-white/85 ${className}`}>
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${config.color} opacity-60`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.color}`} />
      </span>
      <span>{config.label}</span>
    </div>
  );
}
