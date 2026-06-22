import React from 'react';
import TeamChoiceCard from '../TeamChoiceCard';
import soloImg from '../../assets/solo.jpg';
import teamImg from '../../assets/team.jpg';

export default function WorkTypeStep({ workType, setWorkType }) {
  return (
    <div className="text-center">
      <h2 className="card-title">Як ви працюєте?</h2>
      <p className="card-subtitle mb-lg">Ви працюєте самостійно чи з командою?</p>
      <div className="flex flex-center" style={{ gap: 32 }}>
        <TeamChoiceCard
          value="solo"
          label="Я працюю сам(-а)"
          description="Ви єдиний майстер у вашому салоні."
          selected={workType === 'solo'}
          onClick={setWorkType}
          img={soloImg}
        />
        <TeamChoiceCard
          value="team"
          label="У мене є команда"
          description="У вас є кілька майстрів або співробітників."
          selected={workType === 'team'}
          onClick={setWorkType}
          img={teamImg}
        />
        <TeamChoiceCard
          value="me_and_team"
          label="Я і моя команда"
          description="Ви самі працюєте і маєте команду."
          selected={workType === 'me_and_team'}
          onClick={setWorkType}
          img={null}
        />
      </div>
    </div>
  );
}
