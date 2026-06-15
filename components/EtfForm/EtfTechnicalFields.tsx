import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReplicationMethod, UseOfProfit, Domicile } from '@/lib/types';
import { useEtfForm } from '@/hooks/useEtfForm';

type EtfFormHook = ReturnType<typeof useEtfForm>;

export function EtfTechnicalFields({ hook }: { hook: EtfFormHook }) {
  const { state, actions, t } = hook;
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.etfForm.replication}</Label>
          <Select
            value={state.replicationMethod}
            onValueChange={(val) => actions.setReplicationMethod(val as ReplicationMethod)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Physical">{t.etfProperties.Physical}</SelectItem>
              <SelectItem value="Synthetic">{t.etfProperties.Synthetic}</SelectItem>
              <SelectItem value="Optimized">{t.etfProperties.Optimized}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t.etfForm.useOfProfit}</Label>
          <Select
            value={state.useOfProfit}
            onValueChange={(val) => actions.setUseOfProfit(val as UseOfProfit)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Accumulating">{t.etfProperties.Accumulating}</SelectItem>
              <SelectItem value="Distributing">{t.etfProperties.Distributing}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fundSize">{t.etfForm.fundSize}</Label>
          <Input
            id="fundSize"
            type="number"
            inputMode="decimal"
            value={state.fundSize}
            onChange={(e) => actions.setFundSize(e.target.value)}
            placeholder="e.g., 5000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fundAge">{t.etfForm.fundAge}</Label>
          <Input
            id="fundAge"
            type="number"
            inputMode="decimal"
            value={state.fundAge}
            onChange={(e) => actions.setFundAge(e.target.value)}
            placeholder="e.g., 5"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t.etfForm.domicile}</Label>
        <Select
          value={state.domicile}
          onValueChange={(val) => actions.setDomicile(val as Domicile)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ireland">{t.etfProperties.Ireland}</SelectItem>
            <SelectItem value="Luxembourg">{t.etfProperties.Luxembourg}</SelectItem>
            <SelectItem value="US">{t.etfProperties.US}</SelectItem>
            <SelectItem value="Other">{t.sectors.Other}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
