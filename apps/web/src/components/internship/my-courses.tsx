'use client';

import { type VirtualInternshipEnrollment } from '@/hooks/use-virtual-internship';
import { TrackHeaderCard } from './track-header-card';
import styles from '@/app/virtual-internship/page.module.css';

export function MyCourses({
  enrollments,
  onContinue,
}: {
  enrollments: VirtualInternshipEnrollment[];
  onContinue: (enrollment: VirtualInternshipEnrollment) => void;
}) {
  return (
    <section className={styles.myCourses}>
      <div className={styles.myCoursesHead}>
        <h1>My courses</h1>
        <p>{enrollments.length > 1 ? 'Two tracks purchased.' : 'One track purchased.'} Pick up where you left off.</p>
      </div>
      <div className={styles.courseGrid}>
        {enrollments.map((e) => (
          <TrackHeaderCard key={e.id} enrollment={e} onFinishClick={() => onContinue(e)} />
        ))}
      </div>
    </section>
  );
}
