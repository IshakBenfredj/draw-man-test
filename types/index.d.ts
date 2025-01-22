export interface Patient {
  id: string;
  fname: string;
  lname: string;
  birthday: Date;
  gender: "M" | "F";
}

export interface Test {
  id: string;
  patient: string;
  result: number;
  date: Date;
  image: string;
}

export interface TestResults {
  rawScore: number;
  mentalAge: number;
  chronologicalAge: number;
  iq: number;
  explanation: string;
}
