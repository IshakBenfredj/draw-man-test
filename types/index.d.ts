export interface Patient {
  id: string;
  fname: string;
  lname: string;
  birthday: Date;
  gender: 'M' | 'F';
}

export interface Test {
  id: string;
  patient: string;
  result: number;
  date: Date;
  images : string
}