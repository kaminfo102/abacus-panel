import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface MulDivQuestion {
  numbers: number[];
  operators: ('×' | '÷')[];
  answer: number | '';
}

interface StudentMulDivTableProps {
  questions: MulDivQuestion[];
  answers: (string | number)[];
  setAnswers: React.Dispatch<React.SetStateAction<(string | number)[]>>;
  disabled?: boolean;
  showAnswers?: boolean;
}

export const StudentMulDivTable: React.FC<StudentMulDivTableProps> = ({ questions, answers, setAnswers, disabled, showAnswers = false }) => {
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  // تبدیل اعداد فارسی به انگلیسی
  const convertPersianToEnglish = (value: string): string => {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return value.split('').map(char => {
      const index = persianNumbers.indexOf(char);
      return index !== -1 ? index.toString() : char;
    }).join('');
  };

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
      <h2 className="font-bold text-lg mb-2">سوالات ضرب و تقسیم</h2>
      <table className="min-w-full border border-gray-300 rounded-lg" dir="ltr">
        <thead className="bg-violet-700 text-white">
          <tr className="bg-primary/10">
            <th className="p-2 border">شماره</th>
            <th className="p-2 border">سوال</th>
            <th className="p-2 border">جواب </th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, idx) => (
            <tr key={idx}>
              <td className="p-2 border text-center font-bold bg-violet-700 text-white">{idx + 1}</td>
              <td className="border p-2 text-center">
                <div className="flex items-center justify-center gap-2">
                  {q.numbers.map((num, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <span className="mx-3 text-red-600 text-xl font-bold select-none">
                          {q.operators[index - 1]}
                        </span>
                      )}
                      <span className="text-lg font-medium">{num}</span>
                    </React.Fragment>
                  ))}
                </div>
              </td>
              <td className="p-2 border text-center">
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 