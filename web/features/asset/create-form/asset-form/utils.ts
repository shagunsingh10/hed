import { extractUserAndRepo } from './Github'

export const getReaderKwargs = (values: any, assetTypeKey: string) => {
  if (assetTypeKey === 'files') {
    return {
      bucket_name: values.bucketName,
    }
  }

  if (assetTypeKey === 'github') {
    const githubDetails = extractUserAndRepo(values.githubUrl)
    return {
      owner: githubDetails.owner,
      repo: githubDetails.repo,
      github_token: values.githubToken,
      branch: values.branch,
    }
  }

  return {}
}

export const getMetadata = (values: any, assetTypeKey: string) => {
  if (assetTypeKey === 'github') {
    return { base_url: values.githubUrl }
  }

  return {}
}
