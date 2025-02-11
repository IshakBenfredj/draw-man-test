import { Patient } from "../types";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { get_patient_api } from "../lib/api";

interface PatientsContextType {
  patients: Patient[];
  loading: boolean;
  fetchPatients: () => void;
}

const PatientsContext = createContext<PatientsContextType | undefined>(
  undefined
);

export function PatientsProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch(get_patient_api);
      if (!response.ok) return console.log("تعذر جلب بيانات المرضى، يرجى المحاولة لاحقًا.");
      const data: Patient[] = await response.json();
      setPatients(data);
    } catch (error) {
      alert("حدث خطأ أثناء تحميل المرضى، تأكد من اتصالك بالإنترنت أو حاول لاحقًا.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <PatientsContext.Provider value={{ patients, loading, fetchPatients }}>
      {children}
    </PatientsContext.Provider>
  );
}

export function usePatients() {
  const context = useContext(PatientsContext);
  if (context === undefined) {
    throw new Error("يجب استخدام usePatients داخل PatientsProvider.");
  }
  return context;
}
