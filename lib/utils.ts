export const calculateAge = (birthday: Date, inMonths: boolean): number => {
  const today = new Date();
  let years = today.getFullYear() - birthday.getFullYear();
  let months = today.getMonth() - birthday.getMonth();
  let days = today.getDate() - birthday.getDate();

  if (months < 0 || (months === 0 && days < 0)) {
    years--;
    months += 12;
  }

  if (days < 0) {
    const daysInLastMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    months--;
    days += daysInLastMonth;
  }

  if (inMonths) {
    return Math.round(years * 12 + months + days / 30.44);
  } else {
    return years;
  }
};
