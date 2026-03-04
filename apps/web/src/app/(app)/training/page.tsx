import { TrainingLanding } from '@/components/training/training-landing'
import { getTrainingPaths, getUserTrainingProgress } from './actions'

const TrainingPage = async () => {
  const [paths, progress] = await Promise.all([getTrainingPaths(), getUserTrainingProgress()])

  return <TrainingLanding paths={paths} progress={progress} />
}

export default TrainingPage
