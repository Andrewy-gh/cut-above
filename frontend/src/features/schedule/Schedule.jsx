import { useGetScheduleQuery } from './scheduleSlice';

function Schedule() {
  const {
    data: schedule,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetScheduleQuery();

  let content;
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (isSuccess) {
    content = schedule.map((sc) => (
      <div
        key={sc.id}
        style={{
          display: 'flex',
          gap: '1rem',
          outline: 'solid lightblue',
        }}
      >
        <div>{sc.date}</div>
        <div>{sc.time}</div>
        <div>{sc.available.length} slots available</div>
      </div>
    ));
  } else if (isError) {
    content = <p>{error}</p>;
  }

  return (
    <main>
      <h1>Schedule</h1>
      {content}
    </main>
  );
}

export default Schedule;
