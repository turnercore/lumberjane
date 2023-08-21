import React, { useState } from 'react';
import { Input, DatePickerWithPresets, Popover, PopoverContent, PopoverTrigger, Command, CommandInput, CommandGroup, CommandItem, Button, Label, CheckboxWithDay, Select, FormControl, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui";

import type { RestrictionType, Restriction, IpRule, ExpirationRule, HeaderRule, TimeRule, ExpirationRestriction, HeaderRestriction, IpRestriction, TimeRestriction } from '@/types';

type RestrictionInputProps = {
  type: RestrictionType;
  data: HeaderRule | IpRule | TimeRule | ExpirationRule;
  updateData: (data: HeaderRule | IpRule | TimeRule | ExpirationRule) => void;
  remove: () => void;
};

type RestrictionsDropdownProps = {
  onValueChange: (value: Restriction[]) => void;
};

export default function RestrictionsDropdown({ onValueChange }: RestrictionsDropdownProps) {
  const [restrictions, setRestrictions] = useState<Restriction[]>([]);

  const addRestriction = (type: RestrictionType) => {
    let newRestriction: Restriction;
  
    switch (type) {
      case 'headerTags':
        newRestriction = { type, rule: { tag: '', value: '' } };
        break;
      case 'ipAddresses':
        newRestriction = { type, rule: { ipRange: '' } };
        break;
      case 'timeOfDay':
        newRestriction = { type, rule: { start: '', end: '' } };
        break;
      case 'expirationDate':
        newRestriction = { type, rule: { date: new Date() } };
        break;
    }
  
    setRestrictions([...restrictions, newRestriction]);
  };

  const updateRestrictionData = (index: number, restriction: Restriction) => {
    let updatedRestriction: Restriction;

    switch (restriction.type) {
      case 'headerTags':
        updatedRestriction = restriction as HeaderRestriction;
        break;
      case 'ipAddresses':
        updatedRestriction = restriction as IpRestriction;
        break;
      case 'timeOfDay':
        updatedRestriction = restriction as TimeRestriction;
        break;
      case 'expirationDate':
        updatedRestriction = restriction as ExpirationRestriction;
        break;
    }

    const updatedRestrictions = [...restrictions];
    updatedRestrictions[index] = restriction;
    setRestrictions(updatedRestrictions);
    onValueChange(updatedRestrictions);
  };

  const removeRestriction = (index: number) => {
    const updatedRestrictions = [...restrictions];
    updatedRestrictions.splice(index, 1);
    setRestrictions(updatedRestrictions);
    onValueChange(updatedRestrictions);
  };

  return (
    <div className='space-y-4'>
      <h2> Security & Restrictions </h2>
      <div className='space-y-4'>
        {restrictions.map((restriction, index) => (
          <RestrictionInput
            key={index}
            type={restriction.type}
            data={restriction.rule}
            updateData={(data) => updateRestrictionData(index, { ...restriction })}
            remove={() => removeRestriction(index)}
          />
        ))}
      </div>
      <Select onValueChange={(value) => addRestriction(value as RestrictionType)}>
        <FormControl>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Add Restriction" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Restrictions</SelectLabel>
            <SelectItem value="headerTags">Add Header Tag Restriction</SelectItem>
            <SelectItem value="ipAddresses">Add IP Address Restriction</SelectItem>
            <SelectItem value="timeOfDay">Add Time of Day Restriction</SelectItem>
            <SelectItem value="expirationDate">Add Expiration Date Restriction</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function RestrictionInput({ type, data, updateData, remove }: RestrictionInputProps) {
  switch (type) {
    case 'headerTags':
      data = data as HeaderRule;
      return (
        <div className="flex items-center space-x-2">
          <Label>Header:</Label>
          <Input
            type="text"
            placeholder="Header"
            className="w-32"
            value={data.tag || ''}
            onChange={(e) => updateData({ ...data, tag: e.target.value })}
          />
          <Label>Value:</Label>
          <Input
            type="text"
            placeholder="Value"
            className="w-32"
            value={data.value || ''}
            onChange={(e) => updateData({ ...data, value: e.target.value })}
          />
          <Button variant='destructive' onClick={remove}>-</Button>
        </div>
      );
    case 'ipAddresses':
      data = data as IpRule;
      return (
        <div className="flex items-center space-x-2">
          <Label>IP Address Range (CIDR):</Label>
          <Input
            type="text"
            placeholder="192.168.1.0/24"
            className="w-32"
            value={data.ipRange || ''}
            onChange={(e) => updateData({ ...data, ipRange: e.target.value })}
          />
          <Button variant='destructive' onClick={remove}>-</Button>
        </div>
      );
    case 'timeOfDay':
      data = data as TimeRule;
      return (
        <div className="flex items-center space-x-2">
          <Label>Usage Restricted During:</Label>
          <Input
            className='w-32'
            type="time"
            value={data.start || ''}
            onChange={(e) => updateData({ ...data, start: e.target.value })}
          />
          <p> to </p>
          <Input
            className='w-32'
            type="time"
            value={data.end || ''}
            onChange={(e) => updateData({ ...data, end: e.target.value })}
          />
          <div className="flex space-x-1 items-center">
            {/* You can implement logic to handle day selection here */}
          </div>
          <Button variant='destructive' onClick={remove}>-</Button>
        </div>
      );
    case 'expirationDate':
      data = data as ExpirationRule;
      if (!data.date) {
        data.date = new Date();
        console.log("Something is going on setting the date...")
      }
      return (
        <div className="flex items-center space-x-2">
          <Label>Expiration Date:</Label>
          <DatePickerWithPresets
            value={data.date || undefined}
            onChange={(date) => updateData({ ...data, date: date! })}
          />
          <Button variant='destructive' onClick={remove}>-</Button>
        </div>
      );
    default:
      return null;
  }
}
