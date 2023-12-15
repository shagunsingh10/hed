import { extractUserAndRepo } from './Github'

export const getReaderKwargs = (values: any, assetTypeKey: string) => {
  if (assetTypeKey === 'files') {
    return {
      bucketName: values.bucketName,
    }
  }

  if (assetTypeKey === 'github') {
    const githubDetails = extractUserAndRepo(values.github_url)
    return {
      owner: githubDetails.owner,
      repo: githubDetails.repo,
      githubToken: values.githubToken,
      branch: values.branch,
    }
  }

  return {}
}

export const getMetadata = (values: any, assetTypeKey: string) => {
  if (assetTypeKey === 'github') {
    return { baseUrl: values.githubUrl }
  }

  return {}
}
