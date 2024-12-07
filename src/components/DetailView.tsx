import { Person } from '../types/population';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { usePatientData } from '@/hooks/usePatientData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState } from 'react';

interface DetailViewProps {
  person: Person | null;
}

export const DetailView = ({ person }: DetailViewProps) => {
  const [selectedRiskType, setSelectedRiskType] = useState<'relative' | 'absolute'>('relative');

  if (!person) {
    return (
      <Card className="p-6 text-center text-gray-500">
        Select a person to view details
      </Card>
    );
  }

  const formatRiskValue = (value: number | string | null | undefined, riskType: 'relative' | 'absolute') => {
    if (typeof value === 'number') {
      if (riskType === 'absolute') {
        return `${Math.round(value)}%`;
      }
      return value.toFixed(2);
    }
    return 'Not available';
  };

  // Get all risk predictions for this patient
  const { data: patientData } = usePatientData();
  const patientRisks = patientData?.filter(p => 
    p.patient_id === person.patient_id && 
    p.risk_type === selectedRiskType
  ) || [];
  
  // Get predictions for each timeframe
  const oneYearRisks = patientRisks.find(p => p.prediction_timeframe_yrs === 1);
  const fiveYearRisks = patientRisks.find(p => p.prediction_timeframe_yrs === 5);

  const riskFactors = ['ED', 'Hospitalization', 'Fall', 'Stroke', 'MI', 'CKD', 'Mental Health'];

  const isHighRisk = (value: number | string | null | undefined, riskType: 'relative' | 'absolute') => {
    if (typeof value !== 'number') return false;
    return riskType === 'absolute' ? value > 50 : value > 5;
  };

  return (
    <div className="space-y-4">
      <Card className="detail-card">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback>{person.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{person.name || 'Unknown'}</h2>
            <p className="text-gray-500">Patient ID: {person.patient_id}</p>
          </div>
        </div>
      </Card>

      <Card className="detail-card">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Age</span>
            <span>{person.age || 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Gender</span>
            <span>{person.gender || 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Location</span>
            <span>{person.location || 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">MRN</span>
            <span>{person.mrn || 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Last Visit</span>
            <span>{person.last_visit || 'Not specified'}</span>
          </div>
        </div>
      </Card>

      <Card className="detail-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Risk Factors</h3>
          <Select
            value={selectedRiskType}
            onValueChange={(value: 'relative' | 'absolute') => setSelectedRiskType(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select risk type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relative">Relative</SelectItem>
              <SelectItem value="absolute">Absolute</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk Factor</TableHead>
                <TableHead>1 Year Risk</TableHead>
                <TableHead>5 Year Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskFactors.map((risk) => (
                <TableRow key={risk}>
                  <TableCell className="font-medium">{risk}</TableCell>
                  <TableCell className={isHighRisk(oneYearRisks?.[risk as keyof Person], selectedRiskType) ? 'bg-red-100' : ''}>
                    {formatRiskValue(oneYearRisks?.[risk as keyof Person], selectedRiskType)}
                  </TableCell>
                  <TableCell className={isHighRisk(fiveYearRisks?.[risk as keyof Person], selectedRiskType) ? 'bg-red-100' : ''}>
                    {formatRiskValue(fiveYearRisks?.[risk as keyof Person], selectedRiskType)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};