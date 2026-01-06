import BackButton from '@/components/widgets/BackButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { useForm } from 'react-hook-form'

type CreateTemplateForm = {
    templateName: string
    templateDescription: string
    videoUrl: string
    templatePrice: number
    templateThumbnail?: string
    templateTags?: string
}

const AddVideoTemplate = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<CreateTemplateForm>()

    const onSubmit = async (data: CreateTemplateForm) => {
        const payload = {
            ...data,
            templatePrice: Number(data.templatePrice),
            templateTags: data.templateTags
                ? data.templateTags.split(',').map(tag => tag.trim())
                : [],
        }

        console.log('Final Payload:', payload)

        // TODO: API call
        // await api.createTemplate(payload)

        reset()
    }

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-4">
            <BackButton>Add Template</BackButton>

            <Card>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        <div className="space-y-2">
                            <Label>Template Name</Label>
                            <Input placeholder='Template Name' {...register('templateName', { required: 'Name is required' })} />
                            {errors.templateName && (
                                <p className="text-sm text-red-500">
                                    {errors.templateName.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea placeholder='Template Description' {...register('templateDescription', { required: 'Description is required', })} />
                        </div>

                        <div className="space-y-2">
                            <Label>Template Content</Label>
                            <Input type='file' />
                        </div>

                        <div className="space-y-2">
                            <Label>Price (₹)</Label>
                            <Input type="number" {...register('templatePrice', { required: 'Price is required', min: 0, })} />
                        </div>

                        <div className="space-y-2">
                            <Label>Thumbnail URL</Label>
                            <Input placeholder="https://example.com/image.png" {...register('templateThumbnail')} />
                        </div>

                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <Input placeholder="party, edits, modern" {...register('templateTags')} />
                            <p className="text-xs text-muted-foreground">
                                Separate tags using commas
                            </p>
                        </div>

                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? 'Creating...' : 'Create Template'}
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default AddVideoTemplate
