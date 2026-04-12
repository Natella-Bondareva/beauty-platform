import React from 'react';
import TeamChoiceCard from '../TeamChoiceCard';
import soloImg from '../../assets/solo.jpg';
import teamImg from '../../assets/team.jpg';

export default function WorkTypeStep({ workType, setWorkType }) {
  return (
    <div className="text-center">
      <h2 className="card-title">How do you work?</h2>
      <p className="card-subtitle mb-lg">Are you working solo or with a team?</p>
      <div className="flex flex-center" style={{ gap: 32 }}>
        <TeamChoiceCard
          value="solo"
          label="I work alone"
          description="You are the only master in your salon."
          selected={workType === 'solo'}
          onClick={setWorkType}
          img={soloImg}
        />
        <TeamChoiceCard
          value="team"
          label="I have a team"
          description="You have several masters or employees."
          selected={workType === 'team'}
          onClick={setWorkType}
          img={teamImg}
        />
      </div>
    </div>
  );
}