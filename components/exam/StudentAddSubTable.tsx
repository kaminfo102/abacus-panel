import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface AddSubQuestion {
  numbers: number[];
  operators: ('+' | '-')[];
  answer: number | '';
}

interface StudentAddSubTableProps {
  questions: AddSubQuestion[];
  answers: (string | number)[];
  setAnswers: React.Dispatch<React.SetStateAction<(string | number)[]>>;
  disabled?: boolean;
  showAnswers?: boolean;
}

export const StudentAddSubTable: React.FC<StudentAddSubTableProps> = ({ questions, answers, setAnswers, disabled, showAnswers = false }) => {
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  // پیدا کردن بیشترین تعداد عدد در بین سوالات برای تعیین تعداد ردیف‌ها
  const maxRows = Math.max(...questions.map(q => q.numbers.length), 0);

  // تبدیل اعداد فارسی به انگلیسی
  const convertPersianToEnglish = (value: string): string => {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return value.split('').map(char => {
      const index = persianNumbers.indexOf(char);
      return index !== -1 ? index.toString() : char;
    }).join('');
  };

  // هندل تغییر جواب
  const handleAnswerChange = (idx: number, value: string) => {
    // تبدیل اعداد فارسی به انگلیسی
    const englishValue = convertPersianToEnglish(value);
    
    // بررسی اعتبار ورودی
    if (englishValue === '') {
      setAnswers(prev => prev.map((a, i) => i === idx ? '' : a));
      setErrors(prev => ({ ...prev, [idx]: '' }));
    } else if (/^\d+$/.test(englishValue)) {
      setAnswers(prev => prev.map((a, i) => i === idx ? englishValue : a));
      setErrors(prev => ({ ...prev, [idx]: '' }));
    } else {
      toast.error('لطفا فقط عدد وارد کنید');
      setErrors(prev => ({ ...prev, [idx]: 'فقط عدد مجاز است' }));
    }
  };

  return (
    <div className="overflow-x-auto mt-6">
      <h2 className="font-bold text-lg mb-2">سوالات جمع و تفریق</h2>
      <table className="min-w-full border border-gray-300 rounded-lg" dir="ltr">
        <thead>
          <tr className="bg-primary/10">
            <th className="p-2 border text-center align-middle bg-violet-700 text-white" rowSpan={maxRows + 2}>سوال</th>
            {questions.map((_, idx) => (
              <th key={idx} className="p-2 border text-center bg-violet-700 text-white">{idx + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* ردیف‌های اعداد */}
          {Array.from({ length: maxRows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {/* ستون راهنما فقط در اولین ستون */}
              {rowIdx === 0 && <td className="p-2 border text-center align-middle bg-violet-700 text-white" rowSpan={maxRows}> </td>}
              {questions.map((q, colIdx) => (
                <td key={colIdx} className="p-2 border text-center">
                  {q.numbers[rowIdx] !== undefined ? (
                    <>
                      {rowIdx > 0 && q.operators && q.operators[rowIdx - 1] === '-' && (
                        <span className="mr-1 text-red-500">-</span>
                      )}
                      {q.numbers[rowIdx]}
                    </>
                  ) : ''}
                </td>
              ))}
            </tr>
          ))}
          {/* ردیف جواب */}
          <tr>
            <td className="p-2 border text-center font-bold bg-violet-700 text-white">جواب</td>
            {questions.map((q, idx) => (
              <td key={idx} className="p-2 border text-center">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={answers[idx] ?? ''}
                  onChange={e => handleAnswerChange(idx, e.target.value)}
                  disabled={disabled}
                  className={`w-full sm:w-32 mx-auto text-lg sm:text-base ${errors[idx] ? 'border-red-500' : ''}`}
                />
                {errors[idx] && (
                  <div className="text-red-500 text-sm mt-1">{errors[idx]}</div>
                )}
                {showAnswers && (
                  <div className="text-sm text-muted-foreground mt-1">
                    جواب: {q.answer}
                  </div>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}; 