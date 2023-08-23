import React, { useState } from 'react';
import { Input, DatePickerWithPresets, Button, Label, Select, FormControl, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui";
import type { RestrictionType, Restriction, ExpirationRestriction, HeaderRestriction, IpRestriction, TimeRestriction } from '@/types';

// TODO: Refactor into a dropdown instead of a select list, right now the select list displays the last selected item
// To fix this we need to use a dropdown instead of a select list, but it is functional.


type RestrictionsDropdownProps = {
  onValueChange: (value: Restriction[]) => void;
};

type RestrictionInputProps = {
  type: RestrictionType;
  rule: HeaderRestriction['rule'] | IpRestriction['rule'] | TimeRestriction['rule'] | ExpirationRestriction['rule'];
  updateData: (data: any) => void;
  remove: () => void;
};

export default function RestrictionsDropdown({ onValueChange }: RestrictionsDropdownProps) {
  const [restrictions, setRestrictions] = useState<Restriction[]>([]);
  const [selectedValue, setSelectedValue] = useState<RestrictionType | undefined>(undefined);


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
    setSelectedValue(undefined); // Reset the selected value
  };

  const updateRestrictionData = (index: number, rule: any) => {
    const updatedRestrictions = [...restrictions];
    updatedRestrictions[index].rule = rule; // Update the rule with the new data
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
          rule={restriction.rule}
          updateData={(rule) => updateRestrictionData(index, rule)} // Pass the updated data
          remove={() => removeRestriction(index)}
        />        
        ))}
      </div>
        <Select
          key={selectedValue}
          value={selectedValue} // Use the selectedValue state variable
          onValueChange={(value) => {
            setSelectedValue(value as RestrictionType); // Update the selected value when it changes
            addRestriction(value as RestrictionType);
          }}
        >
          <FormControl>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Add Restriction"/>
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Restrictions</SelectLabel>
            <SelectItem value="headerTags">Add Header Tag Restriction</SelectItem>
            <SelectItem value="ipAddresses">Add IP Address Restriction</SelectItem>
            <SelectItem value="timeOfDay">Add Time of Day Restriction</SelectItem>
            {!restrictions.some(restriction => restriction.type === 'expirationDate') && (
              <SelectItem value="expirationDate">Add Expiration Date Restriction</SelectItem>)}          
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function RestrictionInput({ type, rule, updateData, remove }: RestrictionInputProps) {
  switch (type) {
    case 'headerTags':
      rule = rule as HeaderRestriction['rule'];
      return (
        <div className="flex items-center space-x-2">
          <Label>Header:</Label>
          <Input
            type="text"
            placeholder="Header"
            className="w-32"
            value={rule.tag || ''}
            onChange={(e) => updateData({ ...rule, tag: e.target.value })}
          />
          <Label>Value:</Label>
          <Input
            type="text"
            placeholder="Value"
            className="w-32"
            value={rule.value || ''}
            onChange={(e) => updateData({ ...rule, value: e.target.value })}
          />
          <Button variant='destructive' onClick={remove}>-</Button>
        </div>
      );
    case 'ipAddresses':
      rule = rule as IpRestriction['rule'];
      return (
        <div className="flex items-center space-x-2">
          <Label>IP Address Range (CIDR):</Label>
          <Input
            type="text"
            placeholder="192.168.1.0/24"
            className="w-32"
            value={rule.ipRange || ''}
            onChange={(e) => updateData({ ...rule, ipRange: e.target.value })}
          />
          <Button variant='destructive' onClick={remove}>-</Button>
        </div>
      );
    case 'timeOfDay':
      rule = rule as TimeRestriction['rule'];
      return (
        <div className="flex items-center space-x-2">
          <Label>Usage Restricted During:</Label>
          <Input
            className='w-32'
            type="time"
            value={rule.startTime || ''}
            onChange={(e) => updateData({ ...rule, start: e.target.value })}
          />
          <p> to </p>
          <Input
            className='w-32'
            type="time"
            value={rule.endTime || ''}
            onChange={(e) => updateData({ ...rule, end: e.target.value })}
          />
          <div className="flex space-x-1 items-center">
            {/* You can implement logic to handle day selection here */}
          </div>
          <Button variant='destructive' onClick={remove}>-</Button>
        </div>
      );
    case 'expirationDate':
      rule = rule as ExpirationRestriction['rule'];
      if (!rule.expirationDate) {
        rule.expirationDate = new Date();
        console.log("Something is going on setting the date...")
      }
      return (
        <div className="flex items-center space-x-2">
          <Label>Expiration Date:</Label>
          <DatePickerWithPresets
            value={rule.expirationDate || undefined}
            onChange={(expirationDate) => updateData({ ...rule, expirationDate })}
          />
          <Button variant='destructive' onClick={remove}>-</Button>
        </div>
      );
    default:
      return null;
  }
}
