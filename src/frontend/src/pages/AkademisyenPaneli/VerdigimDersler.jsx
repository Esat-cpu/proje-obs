import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import academicianService from '../../shared/api/academicianService.js';

const VerdigimDersler = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [editedGrades, setEditedGrades] = useState({}); // { kayitId: { vize_notu: 50, final_notu: 60 } }

  const { data: coursesData, isLoading: isCoursesLoading } = useQuery({
    queryKey: ['academicianCourses'],
    queryFn: academicianService.getDersler,
  });
  const { data: studentsData, isLoading: isStudentsLoading } = useQuery({
    queryKey: ['courseStudents', selectedCourse?.id],
    queryFn: () => academicianService.getDersOgrencileri(selectedCourse.id),
    enabled: !!selectedCourse, // Eğer selectedCourse null ise bu sorguyu bekletir
  });

  const courses = coursesData || [];
  const students = studentsData || [];

  const handleGradeChange = (kayitId, type, value, row) => {
    setEditedGrades(prev => ({
      ...prev,
      [kayitId]: {
        ...prev[kayitId],
        vize: type === 'vize' ? value : (prev[kayitId]?.vize ?? row.vize_notu),
        final: type === 'final' ? value : (prev[kayitId]?.final ?? row.final_notu)
      }
    }));
  };

  const saveGradesMutation = useMutation({
    mutationFn: async (gradesToUpdate) => {
      const promises = gradesToUpdate.map(grade =>
        academicianService.notGir(grade.id, {
          vize_notu: grade.vize === "" ? null : Number(grade.vize),
          final_notu: grade.final === "" ? null : Number(grade.final)
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      // Başarılı olursa listeyi yenile ve hafızayı temizle
      queryClient.invalidateQueries({ queryKey: ['courseStudents', selectedCourse?.id] });
      setEditedGrades({});
    },
    onError: (error) => {
      // Hata olursa konsola kırmızıyla yaz ve ekrana pop-up çıkar
      console.error("🚨 NOT KAYDETME HATASI:", error);
      console.error("🚨 HATA DETAYI:", error.response?.data);
      alert("Notlar kaydedilirken bir hata oluştu! F12 Konsoluna bak.");
    }
  });

  const handleSaveAll = () => {
    // Sadece üzerinde değişiklik yapılanları bir diziye çeviriyoruz
    const isInvalid = Object.values(editedGrades).some((grade) => {
      const vizeNum = Number(grade.vize);
      const finalNum = Number(grade.final);
      return (
        grade.vize === "" || 
        grade.final === "" || 
        vizeNum < 0 || vizeNum > 100 || 
        finalNum < 0 || finalNum > 100
      );
    });
    if (isInvalid) {
      alert("Hatalı Not Girişi! Notlar boş bırakılamaz ve 0 ile 100 arasında olmalıdır.");
      return; // İşlemi durdur, backend'e bozuk veri yollama!
    }

    const gradesArray = Object.keys(editedGrades).map(id => ({
      id: id,
      vize: editedGrades[id].vize,
      final: editedGrades[id].final
    }));

    if (gradesArray.length > 0) {
      saveGradesMutation.mutate(gradesArray);
    }
  };

  const calculateGrade = (vize, final) => {
    const vizePuan = Number(vize) || 0;
    const finalPuan = Number(final) || 0;
    const avg = Math.round(vize * 0.4 + final * 0.6);
    let letter = 'FF', colorClass = 'badge-danger';
    if (avg >= 88) { letter = 'AA'; colorClass = 'badge-success'; }
    else if (avg >= 74) { letter = 'BB'; colorClass = 'badge-warning'; }
    else if (avg >= 60) { letter = 'CC'; colorClass = 'badge-blue'; }
    return { avg, letter, colorClass };
  };

  // Detay (Not Giriş) Ekranı
  if (selectedCourse) {
    return (
      <div className="card-container" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <button
            className="logout-btn"
            style={{ backgroundColor: '#64748b', color: 'white' }}
            onClick={() => { setSelectedCourse(null); setEditedGrades({}); }}
          >
            <ChevronLeft size={18} /> {t('academician.courses.backBtn', 'Derslere Dön')}
          </button>
          <h2 style={{ margin: 0 }}>{selectedCourse.ders?.ders_kodu} - {selectedCourse.ders?.ad}</h2>
        </div>

        {isStudentsLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>{t('common.loading', 'Öğrenciler yükleniyor...')}</div>
        ) : (
          <>
            <DataTable
              columns={[
                { header: t('academician.table.studentId', 'Öğrenci No'), accessor: 'ogrenci_no' },
                { header: t('academician.table.fullName', 'Ad Soyad'), accessor: 'ogrenci_ad' },
                {
                  header: t('studentDashboard.overview.midterm', 'Vize'),
                  render: (row) => (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="grade-input"
                      value={editedGrades[row.id]?.vize !== undefined ? editedGrades[row.id].vize : (row.vize_notu ?? '')}
                      onChange={(e) => {
                        let val = e.target.value;
                        // GÜVENLİK DUVARI: 100'den büyükse 100'e sabitle, 0'dan küçükse 0 yap
                        if (val !== "") {
                          if (Number(val) > 100) val = "100";
                          if (Number(val) < 0) val = "0";
                        }
                        handleGradeChange(row.id, 'vize', val, row);
                      }}
                    />
                  )
                },
                {
                  header: t('studentDashboard.overview.final', 'Final'),
                  render: (row) => (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="grade-input"
                      value={editedGrades[row.id]?.final !== undefined ? editedGrades[row.id].final : (row.final_notu ?? '')}
                      onChange={(e) => {
                        let val = e.target.value;
                        // GÜVENLİK DUVARI: 100'den büyükse 100'e sabitle, 0'dan küçükse 0 yap
                        if (val !== "") {
                          if (Number(val) > 100) val = "100";
                          if (Number(val) < 0) val = "0";
                        }
                        handleGradeChange(row.id, 'final', val, row);
                      }}
                    />
                  )
                },
                {
                  header: t('academician.table.average', 'Ortalama'),
                  render: (row) => {
                    const currentVize = editedGrades[row.id]?.vize !== undefined ? editedGrades[row.id].vize : row.vize_notu;
                    const currentFinal = editedGrades[row.id]?.final !== undefined ? editedGrades[row.id].final : row.final_notu;
                    return <strong>{calculateGrade(currentVize, currentFinal).avg}</strong>;
                  }
                },
                {
                  header: t('academician.table.letterGrade', 'Harf Notu'),
                  render: (row) => {
                    const currentVize = editedGrades[row.id]?.vize !== undefined ? editedGrades[row.id].vize : row.vize_notu;
                    const currentFinal = editedGrades[row.id]?.final !== undefined ? editedGrades[row.id].final : row.final_notu;
                    const res = calculateGrade(currentVize, currentFinal);
                    return <span className={`badge ${res.colorClass}`}>{res.letter}</span>;
                  }
                }
              ]}
              data={students}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                className="btn-add"
                onClick={handleSaveAll}
                disabled={saveGradesMutation.isPending || Object.keys(editedGrades).length === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {saveGradesMutation.isPending
                  ? t('common.processing', 'Kaydediliyor...')
                  : t('academician.courses.saveBtn', 'Notları Kaydet')}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Liste Ekranı
  return (
    <div className="card-container no-padding">
      <div style={{ padding: '24px' }}>
        <h2 className="dash-section-title">{t('academician.courses.title', 'Verdiğim Dersler')}</h2>
      </div>

      {isCoursesLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>{t('common.loading', 'Dersler yükleniyor...')}</div>
      ) : (
        <>
          <div className="desktop-only">
            <DataTable 
              columns={[
                { header: t('academician.courses.code', 'Ders Kodu'), render: (row) => <strong>{row.ders?.ders_kodu}</strong> },
                { header: t('academician.courses.name', 'Ders Adı'), render: (row) => row.ders?.ad },
                { header: t('academician.courses.class', 'Sınıf'), render: (row) => `${row.ders?.min_sinif}. Sınıf` },
                { header: t('academician.courses.studentCount', 'Kredi'), render: (row) => row.ders?.kredi },
                { header: '', render: (row) => (
                  <button className="btn-add" onClick={() => setSelectedCourse(row)}>{t('academician.courses.actionBtn', 'Öğrenci Listesi / Not Gir')}</button>
                )}
              ]} 
              data={courses} 
            />
          </div>

          <div className="mobile-view" style={{ padding: '0 16px 16px' }}>
            {courses.map((course) => (
              <div key={course.id} className="mobile-grade-entry-card">
                <h4 className="course-name">{course.ders?.ad}</h4>
                <div className="course-info">{course.ders?.ders_kodu} • {course.ders?.min_sinif}. Sınıf • {course.ders?.kredi} Kredi</div>
                <button className="btn-grade-entry-mobile" onClick={() => setSelectedCourse(course)}>
                  {t('academician.courses.actionBtn', 'Öğrenci Listesi / Not Gir')}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VerdigimDersler;