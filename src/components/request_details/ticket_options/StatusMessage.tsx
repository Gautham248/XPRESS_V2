// Status message components
const StatusMessage = ({
    bgColor,
    borderColor,
    iconColor,
    titleColor,
    textColor,
    title,
    message,
    icon
}: {
    bgColor: string;
    borderColor: string;
    iconColor: string;
    titleColor: string;
    textColor: string;
    title: string;
    message: string;
    icon: React.ReactNode;
}) => (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4 text-center`}>
        <div className="flex items-center justify-center mb-2">
            <div className={`w-6 h-6 ${iconColor} mr-2`}>
                {icon}
            </div>
            <h3 className={`text-lg font-semibold ${titleColor}`}>{title}</h3>
        </div>
        <p className={textColor}>{message}</p>
    </div>
);

export default StatusMessage;