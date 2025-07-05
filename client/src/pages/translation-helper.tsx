import Header from '@/components/Header';
import TranslationHelper from '@/components/TranslationHelper';

export default function TranslationHelperPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[
        { label: 'Home', href: '/home' },
        { label: 'Translation Helper' }
      ]} />
      
      <div className="py-8">
        <TranslationHelper />
      </div>
    </div>
  );
}