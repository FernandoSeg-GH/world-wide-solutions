import SectionHeader from '@/components/layout/navbar/SectionHeader';
import SendMessage from '@/components/notifications/send/message';

const AdminNotifications: React.FC = () => {

    return (
        <div>
            <SectionHeader
                title={`Notification Center`}
                subtitle="Send notifications for your users on their cases."
            />
            <SendMessage />
        </div>
    );
};

export default AdminNotifications;
