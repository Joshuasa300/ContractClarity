import Header from '@/components/Header';
import TranslationHelper from '@/components/TranslationHelper';
import TranslationSyncMonitor from '@/components/TranslationSyncMonitor';

export default function TranslationHelperPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[
        { label: 'Home', href: '/home' },
        { label: 'Translation Helper' }
      ]} />
      
      <div className="py-8 space-y-8">
        <div className="max-w-4xl mx-auto px-6">
          <TranslationSyncMonitor />
        </div>
        <TranslationHelper />
      </div>
    </div>
  );
}