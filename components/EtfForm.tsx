'use client';

import { useState } from 'react';
import { Issuer, EtfConfig } from '../lib/types';
import { getCsvParser } from '../lib/parsers';

import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface EtfFormProps {
  onAddEtf: (etf: EtfConfig) => void;
}

export default function EtfForm({ onAddEtf }: EtfFormProps) {
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState<Issuer>('iShares');
  const [ter, setTer] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !ter || !file) {
      setError('Please fill all fields and upload a CSV file.');
      return;
    }

    const terNumber = parseFloat(ter);
    if (isNaN(terNumber) || terNumber < 0) {
      setError('Please enter a valid TER (e.g., 0.22)');
      return;
    }

    setIsLoading(true);

    try {
      const parser = getCsvParser(issuer);
      const result = await parser.parse(file);

      if (result.errors.length > 0 && result.holdings.length === 0) {
        setError(`Failed to parse CSV: ${result.errors[0]}`);
        setIsLoading(false);
        return;
      }

      if (result.holdings.length === 0) {
        setError('No valid holdings found in the CSV. Please check the file format.');
        setIsLoading(false);
        return;
      }

      const newEtf: EtfConfig = {
        id: Math.random().toString(36).substring(7),
        name,
        issuer,
        ter: terNumber,
        globalWeight: 0,
        holdings: result.holdings,
      };

      onAddEtf(newEtf);

      // Reset form
      setName('');
      setTer('');
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while parsing the CSV.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New ETF</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="etf-name">ETF Name / Ticker</Label>
            <Input
              id="etf-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., S&P 500 Information Technology"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Issuer</Label>
              <Select value={issuer} onValueChange={(val) => setIssuer(val as Issuer)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Issuer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iShares">iShares</SelectItem>
                  <SelectItem value="Vanguard">Vanguard</SelectItem>
                  <SelectItem value="Amundi">Amundi</SelectItem>
                  <SelectItem value="Lyxor">Lyxor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ter">TER (%)</Label>
              <Input
                id="ter"
                type="number"
                step="0.01"
                value={ter}
                onChange={(e) => setTer(e.target.value)}
                placeholder="e.g., 0.22"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-file">Holdings CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="cursor-pointer file:text-primary file:font-semibold"
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Processing...' : 'Add ETF'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
