import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEvent } from '@/hooks';
import {
  getFieldValue,
  inputSelector,
  setAlliancePosition,
  updateValue,
  useQRScoutState,
} from '@/store/store';
import React, { useCallback, useEffect, useMemo } from 'react';
import { TBATeamAndRobotInputData } from './BaseInputProps';
import { ConfigurableInputProps } from './ConfigurableInput';

export default function TBATeamAndRobotInput(props: ConfigurableInputProps) {
  const data = useQRScoutState(
    inputSelector<TBATeamAndRobotInputData>(props.section, props.code),
  );
  const matchData = useQRScoutState(state => state.matchData);
  const selectedAlliancePosition = useQRScoutState(
    state => state.selectedAlliancePosition,
  );
  const selectedMatchNumber = useQRScoutState(() => {
    const value = getFieldValue('matchNumber');
    return typeof value === 'number' ? value : null;
  });

  if (!data) {
    return <div>Invalid input</div>;
  }

  const [value, setValue] = React.useState<number | null>(
    data.defaultValue || null,
  );

  // Find all team options from the selected match
  const teamOptions = useMemo(() => {
    if (!matchData || matchData.length === 0 || !selectedMatchNumber) {
      return [];
    }

    const match = matchData.find(
      m => m.comp_level === 'qm' && m.match_number === selectedMatchNumber,
    );

    if (!match) return [];

    const teams: Array<{
      teamNumber: number;
      robotPosition: string;
      alliance: string;
      position: number;
    }> = [];

    match.alliances.red.team_keys.forEach((teamKey, index) => {
      const teamNumber = parseInt(teamKey.substring(3));
      if (!isNaN(teamNumber)) {
        teams.push({
          teamNumber,
          robotPosition: `R${index + 1}`,
          alliance: 'Red',
          position: index + 1,
        });
      }
    });

    match.alliances.blue.team_keys.forEach((teamKey, index) => {
      const teamNumber = parseInt(teamKey.substring(3));
      if (!isNaN(teamNumber)) {
        teams.push({
          teamNumber,
          robotPosition: `B${index + 1}`,
          alliance: 'Blue',
          position: index + 1,
        });
      }
    });

    return teams;
  }, [matchData, selectedMatchNumber]);

  // When match number changes, auto-update team number to whoever holds the saved alliance position
  useEffect(() => {
    if (!selectedAlliancePosition || teamOptions.length === 0) return;
    const team = teamOptions.find(t => t.robotPosition === selectedAlliancePosition);
    if (team) {
      setValue(team.teamNumber);
    } else {
      setValue(null);
      setAlliancePosition(undefined);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMatchNumber, teamOptions]);

  const resetState = useCallback(
    ({ force }: { force: boolean }) => {
      if (force) {
        setValue(data.defaultValue || null);
        setAlliancePosition(undefined);
        return;
      }
      if (data.formResetBehavior === 'preserve') {
        return;
      }
      setValue(data.defaultValue || null);
      setAlliancePosition(undefined);
    },
    [data.defaultValue, data.formResetBehavior],
  );

  useEvent('resetFields', resetState);

  useEffect(() => {
    updateValue(props.code, value);
  }, [value, props.code]);

  const handleSelectChange = useCallback(
    (robotPosition: string) => {
      const team = teamOptions.find(t => t.robotPosition === robotPosition);
      if (team) {
        setValue(team.teamNumber);
        setAlliancePosition(robotPosition);
      }
    },
    [teamOptions],
  );

  // Use a dropdown select if we have team options, otherwise use a regular number input
  if (teamOptions.length > 0) {
    return (
      <Select
        name={data.title}
        onValueChange={handleSelectChange}
        value={selectedAlliancePosition || ''}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a team" />
        </SelectTrigger>
        <SelectContent>
          {teamOptions.map(team => (
            <SelectItem
              key={team.robotPosition}
              value={team.robotPosition}
            >
              Team {team.teamNumber} ({team.alliance} {team.position})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Fall back to standard number input if no team options are available
  return (
    <Input
      type="number"
      value={value || ''}
      id={data.title}
      onChange={e => {
        const parsed = Number(e.target.value);
        if (e.target.value === '') {
          setValue(null);
          return;
        }
        if (isNaN(parsed)) {
          return;
        }
        setValue(parsed);
      }}
      placeholder="Enter team number"
    />
  );
}
