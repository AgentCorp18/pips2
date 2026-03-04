import { TrainingLanding } from '@/components/training/training-landing'
import { getTrainingPaths, getUserTrainingProgress, getPathModuleCounts } from './actions'

const TrainingPage = async () => {
  const [paths, progress, moduleCounts] = await Promise.all([
    getTrainingPaths(),
    getUserTrainingProgress(),
    getPathModuleCounts(),
  ])

  return <TrainingLanding paths={paths} progress={progress} moduleCounts={moduleCounts} />
}

export default TrainingPage
