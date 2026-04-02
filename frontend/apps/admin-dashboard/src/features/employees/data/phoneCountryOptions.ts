export interface PhoneCountryOption {
  value: string;
  name: string;
  shortName: string;
  dialCode: string;
  label: string;
  selectedLabel: string;
  minLength: number;
  maxLength: number;
}

export interface PhoneLengthRule {
  minLength: number;
  maxLength: number;
}

const createPhoneCountryOptionValue = (name: string, dialCode: string): string =>
  `${name}|${dialCode}`;

const createExactPhoneLengthRule = (length: number): PhoneLengthRule => ({
  minLength: length,
  maxLength: length,
});

const DEFAULT_PHONE_LENGTH_RULE: PhoneLengthRule = {
  minLength: 6,
  maxLength: 15,
};

const PHONE_LENGTH_RULES_BY_DIAL_CODE: Record<string, PhoneLengthRule> = {
  '+1': createExactPhoneLengthRule(10),
  '+7': createExactPhoneLengthRule(10),
  '+30': createExactPhoneLengthRule(10),
  '+31': createExactPhoneLengthRule(9),
  '+32': { minLength: 8, maxLength: 9 },
  '+33': createExactPhoneLengthRule(9),
  '+34': createExactPhoneLengthRule(9),
  '+36': { minLength: 8, maxLength: 9 },
  '+39': { minLength: 6, maxLength: 11 },
  '+40': createExactPhoneLengthRule(9),
  '+41': createExactPhoneLengthRule(9),
  '+43': { minLength: 4, maxLength: 13 },
  '+44': { minLength: 7, maxLength: 10 },
  '+45': createExactPhoneLengthRule(8),
  '+46': { minLength: 7, maxLength: 10 },
  '+47': createExactPhoneLengthRule(8),
  '+48': createExactPhoneLengthRule(9),
  '+49': { minLength: 5, maxLength: 13 },
  '+51': { minLength: 8, maxLength: 9 },
  '+52': createExactPhoneLengthRule(10),
  '+53': createExactPhoneLengthRule(8),
  '+54': { minLength: 10, maxLength: 11 },
  '+55': { minLength: 10, maxLength: 11 },
  '+56': createExactPhoneLengthRule(9),
  '+57': createExactPhoneLengthRule(10),
  '+58': createExactPhoneLengthRule(10),
  '+60': { minLength: 7, maxLength: 10 },
  '+62': { minLength: 9, maxLength: 12 },
  '+63': { minLength: 9, maxLength: 10 },
  '+65': createExactPhoneLengthRule(8),
  '+66': { minLength: 8, maxLength: 9 },
  '+81': { minLength: 9, maxLength: 10 },
  '+82': { minLength: 9, maxLength: 10 },
  '+84': { minLength: 9, maxLength: 10 },
  '+86': createExactPhoneLengthRule(11),
  '+90': createExactPhoneLengthRule(10),
  '+91': createExactPhoneLengthRule(10),
  '+92': createExactPhoneLengthRule(10),
  '+93': createExactPhoneLengthRule(9),
  '+94': createExactPhoneLengthRule(9),
  '+95': { minLength: 7, maxLength: 10 },
  '+98': createExactPhoneLengthRule(10),
  '+351': createExactPhoneLengthRule(9),
  '+352': { minLength: 4, maxLength: 11 },
  '+353': { minLength: 7, maxLength: 9 },
  '+354': createExactPhoneLengthRule(7),
  '+355': { minLength: 8, maxLength: 9 },
  '+356': createExactPhoneLengthRule(8),
  '+357': createExactPhoneLengthRule(8),
  '+358': { minLength: 5, maxLength: 12 },
  '+359': { minLength: 7, maxLength: 9 },
  '+370': createExactPhoneLengthRule(8),
  '+371': createExactPhoneLengthRule(8),
  '+372': { minLength: 7, maxLength: 8 },
  '+373': createExactPhoneLengthRule(8),
  '+374': createExactPhoneLengthRule(8),
  '+375': { minLength: 9, maxLength: 10 },
  '+376': createExactPhoneLengthRule(6),
  '+377': createExactPhoneLengthRule(8),
  '+378': { minLength: 6, maxLength: 10 },
  '+379': { minLength: 6, maxLength: 10 },
  '+380': createExactPhoneLengthRule(9),
  '+381': { minLength: 8, maxLength: 9 },
  '+382': createExactPhoneLengthRule(8),
  '+383': createExactPhoneLengthRule(8),
  '+385': { minLength: 8, maxLength: 9 },
  '+386': createExactPhoneLengthRule(8),
  '+387': createExactPhoneLengthRule(8),
  '+389': { minLength: 7, maxLength: 8 },
  '+420': createExactPhoneLengthRule(9),
  '+421': createExactPhoneLengthRule(9),
  '+423': createExactPhoneLengthRule(7),
  '+501': createExactPhoneLengthRule(7),
  '+502': createExactPhoneLengthRule(8),
  '+503': createExactPhoneLengthRule(8),
  '+504': createExactPhoneLengthRule(8),
  '+505': createExactPhoneLengthRule(8),
  '+506': createExactPhoneLengthRule(8),
  '+507': { minLength: 7, maxLength: 8 },
  '+509': createExactPhoneLengthRule(8),
  '+591': createExactPhoneLengthRule(8),
  '+592': createExactPhoneLengthRule(7),
  '+593': { minLength: 8, maxLength: 9 },
  '+595': createExactPhoneLengthRule(9),
  '+597': { minLength: 6, maxLength: 7 },
  '+598': createExactPhoneLengthRule(8),
  '+670': createExactPhoneLengthRule(7),
  '+673': createExactPhoneLengthRule(7),
  '+855': { minLength: 8, maxLength: 9 },
  '+856': { minLength: 8, maxLength: 10 },
  '+880': createExactPhoneLengthRule(10),
  '+886': { minLength: 8, maxLength: 9 },
  '+960': createExactPhoneLengthRule(7),
  '+961': { minLength: 7, maxLength: 8 },
  '+962': { minLength: 8, maxLength: 9 },
  '+963': { minLength: 8, maxLength: 9 },
  '+964': { minLength: 8, maxLength: 10 },
  '+965': createExactPhoneLengthRule(8),
  '+966': createExactPhoneLengthRule(9),
  '+967': { minLength: 8, maxLength: 9 },
  '+968': createExactPhoneLengthRule(8),
  '+970': { minLength: 8, maxLength: 9 },
  '+971': { minLength: 8, maxLength: 9 },
  '+972': { minLength: 8, maxLength: 9 },
  '+973': createExactPhoneLengthRule(8),
  '+974': createExactPhoneLengthRule(8),
  '+975': { minLength: 7, maxLength: 8 },
  '+976': createExactPhoneLengthRule(8),
  '+977': { minLength: 8, maxLength: 10 },
  '+992': createExactPhoneLengthRule(9),
  '+993': createExactPhoneLengthRule(8),
  '+994': createExactPhoneLengthRule(9),
  '+995': createExactPhoneLengthRule(9),
  '+996': createExactPhoneLengthRule(9),
  '+998': createExactPhoneLengthRule(9),
  '+1242': createExactPhoneLengthRule(10),
  '+1246': createExactPhoneLengthRule(10),
  '+1268': createExactPhoneLengthRule(10),
  '+1473': createExactPhoneLengthRule(10),
  '+1758': createExactPhoneLengthRule(10),
  '+1767': createExactPhoneLengthRule(10),
  '+1809': createExactPhoneLengthRule(10),
  '+1868': createExactPhoneLengthRule(10),
  '+1876': createExactPhoneLengthRule(10),
};

const getPhoneLengthRuleByDialCode = (dialCode: string): PhoneLengthRule =>
  PHONE_LENGTH_RULES_BY_DIAL_CODE[dialCode] ?? DEFAULT_PHONE_LENGTH_RULE;

const PHONE_COUNTRY_OPTION_ENTRIES = [
  ['Afghanistan', '+93'],
  ['Albania', '+355'],
  ['Andorra', '+376'],
  ['Antigua and Barbuda', '+1268', 'A&B'],
  ['Argentina', '+54'],
  ['Armenia', '+374'],
  ['Austria', '+43'],
  ['Azerbaijan', '+994'],
  ['Bahamas', '+1242'],
  ['Bahrain', '+973'],
  ['Bangladesh', '+880'],
  ['Barbados', '+1246'],
  ['Belarus', '+375'],
  ['Belgium', '+32'],
  ['Belize', '+501'],
  ['Bhutan', '+975'],
  ['Bolivia', '+591'],
  ['Bosnia and Herzegovina', '+387', 'B&H'],
  ['Brazil', '+55'],
  ['Brunei', '+673'],
  ['Bulgaria', '+359'],
  ['Cambodia', '+855'],
  ['Canada', '+1'],
  ['Chile', '+56'],
  ['China', '+86'],
  ['Colombia', '+57'],
  ['Costa Rica', '+506'],
  ['Croatia', '+385'],
  ['Cuba', '+53'],
  ['Cyprus', '+357'],
  ['Czech Republic', '+420', 'Czechia'],
  ['Denmark', '+45'],
  ['Dominica', '+1767'],
  ['Dominican Republic', '+1809', 'D.R.'],
  ['Ecuador', '+593'],
  ['El Salvador', '+503'],
  ['Estonia', '+372'],
  ['Finland', '+358'],
  ['France', '+33'],
  ['Georgia', '+995'],
  ['Germany', '+49'],
  ['Greece', '+30'],
  ['Grenada', '+1473'],
  ['Guatemala', '+502'],
  ['Guyana', '+592'],
  ['Haiti', '+509'],
  ['Honduras', '+504'],
  ['Hungary', '+36'],
  ['Iceland', '+354'],
  ['India', '+91'],
  ['Indonesia', '+62'],
  ['Iran', '+98'],
  ['Iraq', '+964'],
  ['Ireland', '+353'],
  ['Israel', '+972'],
  ['Italy', '+39'],
  ['Jamaica', '+1876'],
  ['Japan', '+81'],
  ['Jordan', '+962'],
  ['Kazakhstan', '+7'],
  ['Kosovo', '+383'],
  ['Kuwait', '+965'],
  ['Kyrgyzstan', '+996'],
  ['Laos', '+856'],
  ['Latvia', '+371'],
  ['Lebanon', '+961'],
  ['Liechtenstein', '+423'],
  ['Lithuania', '+370'],
  ['Luxembourg', '+352'],
  ['Malaysia', '+60'],
  ['Maldives', '+960'],
  ['Malta', '+356'],
  ['Mexico', '+52'],
  ['Moldova', '+373'],
  ['Monaco', '+377'],
  ['Mongolia', '+976'],
  ['Montenegro', '+382'],
  ['Myanmar', '+95'],
  ['Nepal', '+977'],
  ['Netherlands', '+31'],
  ['Nicaragua', '+505'],
  ['North Korea', '+850', 'N. Korea'],
  ['North Macedonia', '+389', 'N. Mac.'],
  ['Norway', '+47'],
  ['Oman', '+968'],
  ['Pakistan', '+92'],
  ['Palestine', '+970'],
  ['Panama', '+507'],
  ['Paraguay', '+595'],
  ['Peru', '+51'],
  ['Philippines', '+63'],
  ['Poland', '+48'],
  ['Portugal', '+351'],
  ['Qatar', '+974'],
  ['Romania', '+40'],
  ['Russia', '+7'],
  ['Saint Lucia', '+1758', 'St. Lucia'],
  ['San Marino', '+378'],
  ['Saudi Arabia', '+966', 'Saudi'],
  ['Serbia', '+381'],
  ['Singapore', '+65'],
  ['Slovakia', '+421'],
  ['Slovenia', '+386'],
  ['South Korea', '+82', 'S. Korea'],
  ['Spain', '+34'],
  ['Sri Lanka', '+94'],
  ['Suriname', '+597'],
  ['Sweden', '+46'],
  ['Switzerland', '+41'],
  ['Syria', '+963'],
  ['Taiwan', '+886'],
  ['Tajikistan', '+992'],
  ['Thailand', '+66'],
  ['Timor-Leste', '+670', 'T-L'],
  ['Trinidad and Tobago', '+1868', 'T&T'],
  ['Turkey', '+90'],
  ['Turkmenistan', '+993'],
  ['Ukraine', '+380'],
  ['United Arab Emirates', '+971', 'UAE'],
  ['United Kingdom', '+44', 'UK'],
  ['United States', '+1', 'USA'],
  ['Uruguay', '+598'],
  ['Uzbekistan', '+998'],
  ['Vatican City', '+379', 'Vatican'],
  ['Venezuela', '+58'],
  ['Vietnam', '+84'],
  ['Yemen', '+967'],
] as const;

export const VIETNAM_DIAL_CODE = '+84';

const createDefaultSelectedShortName = (name: string): string => {
  const normalizedParts = name
    .split(/[\s-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (normalizedParts.length <= 1) {
    const compactName = normalizedParts[0] ?? name;
    return compactName.slice(0, Math.min(2, compactName.length)).toUpperCase();
  }

  return normalizedParts
    .map((part) => part.charAt(0).toUpperCase())
    .join('-');
};

export const PHONE_COUNTRY_OPTIONS: PhoneCountryOption[] = PHONE_COUNTRY_OPTION_ENTRIES
  .map(([name, dialCode, shortName]) => {
    const resolvedShortName = shortName ?? createDefaultSelectedShortName(name);
    const lengthRule = getPhoneLengthRuleByDialCode(dialCode);

    return {
      value: createPhoneCountryOptionValue(name, dialCode),
      name,
      shortName: resolvedShortName,
      dialCode,
      label: `${name} (${dialCode})`,
      selectedLabel: `${resolvedShortName} (${dialCode})`,
      minLength: lengthRule.minLength,
      maxLength: lengthRule.maxLength,
    };
  })
  .sort((left, right) => left.name.localeCompare(right.name, 'en'));

export const PHONE_COUNTRY_NAMES: string[] = PHONE_COUNTRY_OPTIONS.map((option) => option.name);

export const DEFAULT_PHONE_COUNTRY_VALUE = createPhoneCountryOptionValue('Vietnam', VIETNAM_DIAL_CODE);

export const getDialCodeByPhoneCountryValue = (value: string): string =>
  PHONE_COUNTRY_OPTIONS.find((option) => option.value === value)?.dialCode ?? VIETNAM_DIAL_CODE;

export const getPhoneCountryOptionByValue = (value: string): PhoneCountryOption | undefined =>
  PHONE_COUNTRY_OPTIONS.find((option) => option.value === value);

export const getPhoneLengthRuleByCountryValue = (value: string): PhoneLengthRule =>
  getPhoneLengthRuleByDialCode(getDialCodeByPhoneCountryValue(value));

export const getPhoneLengthDescriptionByCountryValue = (value: string): string => {
  const { minLength, maxLength } = getPhoneLengthRuleByCountryValue(value);

  return minLength === maxLength ? `${minLength} số` : `${minLength}-${maxLength} số`;
};

export const validatePhoneNumberByCountryValue = (value: string, phone: string): string | null => {
  const normalizedPhone = phone.trim();

  if (!normalizedPhone) {
    return 'Số điện thoại là bắt buộc';
  }

  if (!/^\d+$/.test(normalizedPhone)) {
    return 'Số điện thoại chỉ được chứa chữ số';
  }

  if (/^0+$/.test(normalizedPhone)) {
    return 'Số điện thoại không hợp lệ';
  }

  const { minLength, maxLength } = getPhoneLengthRuleByCountryValue(value);
  if (normalizedPhone.length < minLength || normalizedPhone.length > maxLength) {
    const dialCode = getDialCodeByPhoneCountryValue(value);

    return minLength === maxLength
      ? `Với mã ${dialCode}, số điện thoại phải gồm ${minLength} số`
      : `Với mã ${dialCode}, số điện thoại phải gồm từ ${minLength} đến ${maxLength} số`;
  }

  return null;
};
