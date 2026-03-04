import { notFound } from 'next/navigation'
import { ModuleDetailClient } from './module-detail-client'
import { getTrainingPath, getTrainingModule, getUserTrainingProgress } from '../../../actions'
import {
  getModuleExercises,
  getUserExerciseData,
  checkPrerequisitesMet,
} from '../../../exercise-actions'

type ModulePageProps = {
  params: Promise<{ pathSlug: string; moduleSlug: string }>
}

const ModulePage = async ({ params }: ModulePageProps) => {
  const { pathSlug, moduleSlug } = await params
  const [path, module] = await Promise.all([
    getTrainingPath(pathSlug),
    getTrainingModule(moduleSlug),
  ])

  if (!path || !module || module.path_id !== path.id) {
    notFound()
  }

  const [exercises, progress] = await Promise.all([
    getModuleExercises(module.id),
    getUserTrainingProgress(),
  ])

  const exerciseIds = exercises.map((e) => e.id)
  const [exerciseData, prerequisitesMet] = await Promise.all([
    getUserExerciseData(exerciseIds),
    checkPrerequisitesMet(module.prerequisites),
  ])

  const moduleProgress = progress.find((p) => p.module_id === module.id)

  return (
    <ModuleDetailClient
      path={path}
      module={module}
      exercises={exercises}
      exerciseData={exerciseData}
      moduleProgress={moduleProgress ?? null}
      prerequisitesMet={prerequisitesMet}
    />
  )
}

export default ModulePage
