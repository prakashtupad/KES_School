import React from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const WHATSAPP_NUMBER = '917795770785';

const ENQUIRY_TEXT_EN = [
  'Namaste Mahesh Sir,',
  '',
  'I would like to enquire about 2026-2027 admission at *Shri Siddharoodha English Medium School, Khanatti*.',
  '',
  "• Child's Name: ",
  '• Class: (Nursery / LKG / UKG / Primary)',
  '• Village / Town: ',
  '• School Van Required: (Yes / No)',
  '',
  'Please share admission details. Thank you!',
].join('\n');

const ENQUIRY_TEXT_KN = [
  'ನಮಸ್ಕಾರ ಮಹೇಶ್ ಸರ್,',
  '',
  '*ಶ್ರೀ ಸಿದ್ಧಾರೂಢ ಆಂಗ್ಲ ಮಾಧ್ಯಮ ಶಾಲೆ, ಖಾನಟ್ಟಿ* ಯಲ್ಲಿ 2026-2027 ನೇ ಸಾಲಿನ ಪ್ರವೇಶಾತಿ ಬಗ್ಗೆ ವಿಚಾರಿಸಲು ಬಯಸುತ್ತೇನೆ.',
  '',
  '• ಮಗುವಿನ ಹೆಸರು: ',
  '• ತರಗತಿ: (Nursery / LKG / UKG / Primary)',
  '• ಗ್ರಾಮ / ಪಟ್ಟಣ: ',
  '• ಶಾಲಾ ವಾಹನ ಸೌಲಭ್ಯ ಬೇಕೇ: (ಹೌದು / ಇಲ್ಲ)',
  '',
  'ದಯವಿಟ್ಟು ಪ್ರವೇಶಾತಿ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ. ಧನ್ಯವಾದಗಳು!',
].join('\n');

export default function FloatingWhatsAppButton() {
  const location = useLocation();
  const { language } = useLanguage();

  // Strict scope guard: render ONLY on the public-facing website
  if (location.pathname.startsWith('/portal')) {
    return null;
  }

  const enquiryText = language === 'kn' ? ENQUIRY_TEXT_KN : ENQUIRY_TEXT_EN;
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(enquiryText)}`;
  const buttonLabel =
    language === 'kn' ? 'WhatsApp ನಲ್ಲಿ ವಿಚಾರಿಸಿ' : 'Ask / Enquire on WhatsApp';

  return (
    <a
      href={waHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={buttonLabel}
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 bg-white text-slate-800 border border-emerald-200 shadow-lg hover:shadow-xl hover:border-emerald-300 rounded-full px-4 py-2.5 flex items-center gap-2 text-xs font-semibold transition-all duration-200 active:scale-95"
    >
      <MessageCircle className="w-4 h-4 text-[#059669] flex-shrink-0" />
      <span>{buttonLabel}</span>
    </a>
  );
}
