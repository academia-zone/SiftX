import React, { useState, useMemo } from 'react';
import { Plus, Trash2, TrendingUp } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'F': 0.0,
};

export const GpaCgpaCalculator: React.FC = () => {
  const [tab, setTab] = useState<'semester' | 'cumulative'>('semester');

  // Semester GPA Courses
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: 'Computer Programming', credits: 3, grade: 'A' },
    { id: '2', name: 'Calculus & Analytical Geometry', credits: 3, grade: 'B+' },
    { id: '3', name: 'Digital Logic Design', credits: 4, grade: 'A-' },
    { id: '4', name: 'English Composition', credits: 2, grade: 'B' },
    { id: '5', name: 'Physics Laboratory', credits: 1, grade: 'A' },
  ]);

  // Cumulative CGPA States
  const [priorCgpa, setPriorCgpa] = useState<number>(3.25);
  const [priorCredits, setPriorCredits] = useState<number>(64);
  const [currentGpa, setCurrentGpa] = useState<number>(3.65);
  const [currentCredits, setCurrentCredits] = useState<number>(18);

  // Target CGPA States
  const [targetCgpa, setTargetCgpa] = useState<number>(3.5);
  const [remainingCredits, setRemainingCredits] = useState<number>(30);

  // Calculate Semester GPA
  const semesterStats = useMemo(() => {
    let totalCredits = 0;
    let totalPoints = 0;

    courses.forEach((c) => {
      const cr = Number(c.credits) || 0;
      const pts = (GRADE_POINTS[c.grade] ?? 0) * cr;
      totalCredits += cr;
      totalPoints += pts;
    });

    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    return {
      gpa: Number(gpa.toFixed(2)),
      totalCredits,
      totalPoints: Number(totalPoints.toFixed(1)),
    };
  }, [courses]);

  // Calculate Cumulative CGPA
  const cumulativeStats = useMemo(() => {
    const priorTotalPoints = priorCgpa * priorCredits;
    const currentTotalPoints = currentGpa * currentCredits;
    const totalCredits = priorCredits + currentCredits;
    const newCgpa = totalCredits > 0 ? (priorTotalPoints + currentTotalPoints) / totalCredits : 0;

    // Required GPA for target
    const currentCompletedPoints = priorCgpa * priorCredits;
    const totalTargetCredits = priorCredits + remainingCredits;
    const requiredTotalPoints = targetCgpa * totalTargetCredits;
    const requiredPointsForRemaining = requiredTotalPoints - currentCompletedPoints;
    const requiredGpa = remainingCredits > 0 ? requiredPointsForRemaining / remainingCredits : 0;

    return {
      newCgpa: Number(newCgpa.toFixed(2)),
      totalCredits,
      requiredGpa: Number(requiredGpa.toFixed(2)),
    };
  }, [priorCgpa, priorCredits, currentGpa, currentCredits, targetCgpa, remainingCredits]);

  const addCourse = () => {
    const newId = Date.now().toString();
    setCourses([...courses, { id: newId, name: `Course ${courses.length + 1}`, credits: 3, grade: 'B' }]);
  };

  const removeCourse = (id: string) => {
    if (courses.length <= 1) return;
    setCourses(courses.filter((c) => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  return (
    <div className="space-y-6">
      {/* Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setTab('semester')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            tab === 'semester'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          Semester GPA Calculator
        </button>

        <button
          type="button"
          onClick={() => setTab('cumulative')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            tab === 'cumulative'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          Cumulative CGPA & Target Planner
        </button>
      </div>

      {tab === 'semester' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Courses Input Table (8 Cols) */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Enrolled Semester Courses</h3>
                <p className="text-xs text-slate-500">Enter your course names, credit hours, and expected letter grades</p>
              </div>

              <button
                type="button"
                onClick={addCourse}
                className="px-3.5 py-1.5 rounded-xl bg-[#0176fd] hover:bg-[#005cd6] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Course</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {courses.map((course, idx) => (
                <div key={course.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap sm:flex-nowrap items-center gap-3">
                  <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">
                    #{idx + 1}
                  </span>

                  <input
                    type="text"
                    value={course.name}
                    onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                    placeholder="Course title..."
                    className="flex-1 min-w-[150px] p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#0176fd]"
                  />

                  {/* Credit Hours */}
                  <div className="w-28 flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium">Credits:</span>
                    <select
                      value={course.credits}
                      onChange={(e) => updateCourse(course.id, 'credits', parseInt(e.target.value))}
                      className="p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#0176fd]"
                    >
                      {[1, 2, 3, 4, 5, 6].map((cr) => (
                        <option key={cr} value={cr}>{cr} Cr</option>
                      ))}
                    </select>
                  </div>

                  {/* Grade */}
                  <div className="w-28 flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium">Grade:</span>
                    <select
                      value={course.grade}
                      onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                      className="p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#0176fd]"
                    >
                      {Object.keys(GRADE_POINTS).map((g) => (
                        <option key={g} value={g}>{g} ({GRADE_POINTS[g].toFixed(1)})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCourse(course.id)}
                    disabled={courses.length <= 1}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30 cursor-pointer"
                    title="Remove Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Results Summary Card (4 Cols) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50/60 border border-blue-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Semester GPA</span>
              <div className="text-5xl font-black text-[#0176fd] my-2 font-mono">
                {semesterStats.gpa.toFixed(2)}
              </div>
              <span className="text-xs font-bold text-slate-500">Out of 4.00</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500 font-medium">Total Credit Hours:</span>
                <span className="font-bold font-mono text-slate-900">{semesterStats.totalCredits} Cr</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500 font-medium">Total Quality Points:</span>
                <span className="font-bold font-mono text-slate-900">{semesterStats.totalPoints}</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500 font-medium">Academic Standing:</span>
                <span className={`font-bold ${
                  semesterStats.gpa >= 3.5 ? 'text-emerald-600' : semesterStats.gpa >= 3.0 ? 'text-blue-600' : 'text-amber-600'
                }`}>
                  {semesterStats.gpa >= 3.7 ? "Dean's Honor List" : semesterStats.gpa >= 3.0 ? 'Good Standing' : 'Average'}
                </span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Cumulative CGPA & Target Planner */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
              Prior & Current Academic Metrics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Previous CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={priorCgpa}
                  onChange={(e) => setPriorCgpa(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-[#0176fd]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Previous Completed Credits</label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={priorCredits}
                  onChange={(e) => setPriorCredits(parseInt(e.target.value) || 0)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-[#0176fd]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Current Semester Expected GPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={currentGpa}
                  onChange={(e) => setCurrentGpa(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-[#0176fd]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Current Semester Credits</label>
                <input
                  type="number"
                  min="1"
                  max="35"
                  value={currentCredits}
                  onChange={(e) => setCurrentCredits(parseInt(e.target.value) || 0)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-[#0176fd]"
                />
              </div>
            </div>

            {/* Target Forecast Section */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#0176fd]" />
                <span>Graduation Target Forecast</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Target Graduation CGPA</label>
                  <input
                    type="number"
                    step="0.05"
                    min="2.0"
                    max="4.0"
                    value={targetCgpa}
                    onChange={(e) => setTargetCgpa(parseFloat(e.target.value) || 0)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-[#0176fd]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Remaining Degree Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={remainingCredits}
                    onChange={(e) => setRemainingCredits(parseInt(e.target.value) || 0)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-[#0176fd]"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">New Cumulative CGPA</span>
              <div className="text-5xl font-black text-emerald-600 my-2 font-mono">
                {cumulativeStats.newCgpa.toFixed(2)}
              </div>
              <span className="text-xs font-bold text-slate-500">Across {cumulativeStats.totalCredits} Total Credits</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Target Requirement:</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                To achieve your target CGPA of <strong className="text-slate-900">{targetCgpa.toFixed(2)}</strong>, you must maintain an average GPA of{' '}
                <strong className={`font-mono text-sm ${cumulativeStats.requiredGpa > 4.0 ? 'text-rose-600' : 'text-[#0176fd]'}`}>
                  {cumulativeStats.requiredGpa > 4.0 ? 'Impossible (>4.0)' : cumulativeStats.requiredGpa.toFixed(2)}
                </strong>{' '}
                across your remaining {remainingCredits} credits.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
